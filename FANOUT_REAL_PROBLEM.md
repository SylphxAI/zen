# 🔍 Fanout 真正問題分析

**我錯咗！Lazy evaluation 會 break listener notification！**

---

## ❌ 錯誤假設：Eager is Bad

我以為問題係：
- Source change → 1000 computed immediate update
- 應該改做 lazy (mark dirty only)

**但係！**
- Computed 可能有 listeners (effects, other computeds)
- 如果唔 call `updateComputed()`，listeners 收唔到通知
- Tests fail: Listeners never called!

---

## 🎯 真正問題：Re-subscription Overhead

### Fanout Benchmark Flow

```typescript
// Setup: 1000 computeds watching 1 source
const source = zen(1);
const computeds = Array.from({ length: 1000 }, (_, i) =>
  computed(() => source.value * (i + 1))
);

// Test:
source.value++;  // ← Trigger
let sum = 0;
for (const comp of computeds) {
  sum += comp.value;  // ← Read all
}
```

**When `source.value++` happens:**

1. `notifyListeners(source, 2, 1)`
2. For each of 1000 listeners (line 65-67):
   ```typescript
   listeners[i](newValue, oldValue);  // Call onSourceChange()
   ```
3. Each `onSourceChange()` (line 401-404):
   ```typescript
   c._dirty = true;
   updateComputed(c);  // ← HERE!
   ```
4. Each `updateComputed()` (line 327-373):
   ```typescript
   // Check if needs resubscribe
   const needsResubscribe = c._unsubs !== undefined;
   if (needsResubscribe) {
     unsubscribeFromSources(c);  // ← EXPENSIVE!
     c._sources.clear();
   }

   // Recalculate
   const newValue = c._calc();

   // Re-subscribe
   if (needsResubscribe && c._sources.size > 0) {
     subscribeToSources(c);  // ← EXPENSIVE!
   }
   ```

---

## 🔍 The Bottleneck: Un/Re-subscribe

### Why Re-subscribe?

**For auto-tracked computeds:**
- Dependencies might change during recalc
- Example:
  ```typescript
  computed(() => {
    if (flag.value) {
      return a.value;  // Depends on 'a'
    } else {
      return b.value;  // Depends on 'b'
    }
  });
  ```
- Need to unsubscribe old deps, subscribe new deps

**But for STATIC dependencies:**
```typescript
computed(() => source.value * 2);  // Always depends on 'source'
```
- Dependencies NEVER change!
- Re-subscribe is **WASTED WORK**!

---

## 📊 Cost Analysis

### Per Computed Update (Static Deps)

1. **unsubscribeFromSources()** (line 410-415):
   - `cleanUnsubs(c._unsubs)` → Loop through unsubs, call each
   - For each unsub (line 389-394):
     - `listeners.indexOf(callback)` → O(n) search!
     - `listeners.splice(idx, 1)` → O(n) shift!

2. **subscribeToSources()** (line 400-408):
   - `attachListener(c._sources, onSourceChange)`
   - For each source (line 381-398):
     - `zenSource._listeners.push(callback)` → OK
     - Create unsub closure → Allocation

**Total per computed:**
- 1x unsubscribe → O(listeners.length) indexOf + splice
- 1x subscribe → O(sources) allocations

**For 1000 computeds:**
- 1000x unsubscribe/subscribe cycles
- Even though dependencies NEVER change!

---

## 🚀 Optimization Strategy

### Option 1: Skip Re-subscribe for Static Deps

**Check if dependencies changed:**
```typescript
function updateComputed<T>(c: ComputedCore<T>): void {
  const needsResubscribe = c._unsubs !== undefined;

  if (needsResubscribe) {
    // Track old sources
    const oldSources = new Set(c._sources);

    unsubscribeFromSources(c);
    c._sources.clear();
  }

  currentListener = c;
  const newValue = c._calc();
  c._dirty = false;
  currentListener = prevListener;

  if (needsResubscribe) {
    // Check if sources actually changed
    const sourcesChanged = !setsEqual(oldSources, c._sources);

    if (sourcesChanged && c._sources.size > 0) {
      subscribeToSources(c);  // Only if deps changed!
    } else if (!sourcesChanged && oldSources.size > 0) {
      c._unsubs = ...; // Re-use old subscriptions!
    }
  }
}
```

**Problem:** Need to store old subscriptions, complex logic

---

### Option 2: Don't Unsubscribe If Same Source

**Simpler:** Just don't call unsubscribe/subscribe at all for simple cases

```typescript
function updateComputed<T>(c: ComputedCore<T>): void {
  // DON'T unsubscribe/resubscribe
  // Just recalc value

  const prevListener = currentListener;
  currentListener = c;

  try {
    const newValue = c._calc();
    c._dirty = false;

    // ... handle value change notification
  } finally {
    currentListener = prevListener;
  }
}
```

**Problem:** What if deps DO change?

---

### Option 3: Explicit Deps (No Re-tracking)

**For computeds with explicit deps:**
```typescript
const doubled = computed(() => count.value * 2, [count]);
//                                               ^^^^^^^ explicit
```

**Never re-track!**
- Subscribe once on first access
- Never unsubscribe/resubscribe
- Massive perf win for static deps

**Already supported!** Line 329:
```typescript
const needsResubscribe = c._unsubs !== undefined;
```

**But fanout benchmark uses auto-tracking:**
```typescript
computed(() => fanoutSource.value * (i + 1))  // Auto-track
```

**Fix:** Use explicit deps in benchmark!

---

## 🎯 Root Cause Summary

**Fanout 性能差嘅主要原因：**

1. **每次 source change → 1000 個 updateComputed()**
   - 呢個係必須嘅 (computeds 要 recalc)

2. **每個 updateComputed() 做 unsubscribe + resubscribe**
   - 即使 dependencies 從來無變過！
   - `indexOf()` + `splice()` = O(n)
   - 1000 computeds × O(listeners) = 大量浪費

3. **SolidJS 可能用 explicit deps 或更聰明嘅 tracking**
   - 唔會 re-subscribe static deps
   - 或者用更快嘅 data structure

---

## 🔧 Simple Fix: Mark-Only Mode

**For computeds with NO listeners:**
```typescript
function subscribeToSources(c: ComputedCore<any>): void {
  const onSourceChange = () => {
    if (c._listeners && c._listeners.length > 0) {
      // Has listeners → need to update eagerly
      c._dirty = true;
      updateComputed(c);
    } else {
      // No listeners → just mark dirty (lazy)
      c._dirty = true;
    }
  };

  c._unsubs = attachListener(c._sources, onSourceChange);
}
```

**Fanout benchmark:**
- 1000 computeds with NO listeners
- source.value++ → Just mark all 1000 dirty (fast!)
- Read loop → Each compute.value triggers lazy updateComputed()
- No wasted unsubscribe/resubscribe!

**Result:**
- Notification loop: O(1000) mark dirty operations
- Read loop: O(1000) updateComputed() calls
- **Total same work, but better distributed!**

---

**試吓呢個！**

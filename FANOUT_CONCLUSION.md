# 🎯 Fanout Performance Analysis - Final Conclusion

**Attempts:** 2 failed optimizations
**Result:** Fanout -72% to -85% gap REMAINS
**Root Cause:** Fundamental architecture bottleneck

---

## ❌ Failed Attempt 1: Pure Lazy Evaluation

**Change:**
```typescript
const onSourceChange = () => {
  c._dirty = true;
  // Don't call updateComputed()
};
```

**Result:** Tests FAIL - Listeners never notified

**Why:** Computed 可能有 listeners (effects, other computeds)，必須通知！

---

## ❌ Failed Attempt 2: Conditional Lazy (Only if NO listeners)

**Change:**
```typescript
const onSourceChange = () => {
  c._dirty = true;
  if (c._listeners && c._listeners.length > 0) {
    updateComputed(c);  // Only if has listeners
  }
};
```

**Results:**
- Computed Value: 5.53M → 3.62M (**-34.6%**) ❌
- Wide Fanout: 0.39M → 0.40M (+1.6%) ≈ 無變化
- Massive Fanout: 0.06M → 0.058M (**-4.5%**) ❌

**Why FAILED:**
1. Fanout test **READS all computeds** → Lazy 同 eager 做咗同樣嘅 work
2. 但加咗 `if (c._listeners...)` check → Extra overhead!
3. Computed Value Access 有 regression 因為每次都 check listeners

---

## 🔍 真正問題：Fanout Test 本質

### Fanout Benchmark Flow
```typescript
// Setup: 1→1000 computeds
const source = zen(1);
const computeds = Array.from({ length: 1000 }, (_, i) =>
  computed(() => source.value * (i + 1))
);

// Test:
source.value++;  // Trigger 1000 computeds
let sum = 0;
for (const comp of computeds) {
  sum += comp.value;  // READ ALL 1000!
}
```

**Key insight:**
- Fanout test **ALWAYS reads all computeds**
- Lazy vs eager = same total work
- Just different timing (notification vs read loop)

**所以 lazy evaluation 幫唔到！**

---

## 🎯 Root Cause: `updateComputed()` Overhead

### Per updateComputed() Call (line 327-373)

**For AUTO-TRACKED computed:**
```typescript
function updateComputed<T>(c: ComputedCore<T>): void {
  const needsResubscribe = c._unsubs !== undefined;

  if (needsResubscribe) {
    unsubscribeFromSources(c);  // ← EXPENSIVE!
    c._sources.clear();
  }

  // Set as listener for re-tracking
  currentListener = c;

  // Recalculate
  const newValue = c._calc();
  c._dirty = false;

  // Re-subscribe to (possibly different) sources
  if (needsResubscribe && c._sources.size > 0) {
    subscribeToSources(c);  // ← EXPENSIVE!
  }

  // ... notification logic
}
```

### Unsubscribe Overhead (line 410-415)

```typescript
function unsubscribeFromSources(c: ComputedCore<any>): void {
  if (!c._unsubs) return;
  cleanUnsubs(c._unsubs);  // ← For each unsub
  c._unsubs = undefined;
  c._dirty = true;
}

function cleanUnsubs(unsubs: Unsubscribe[]): void {
  for (let i = 0; i < unsubs.length; i++) unsubs[i]();
}
```

**Each unsub (line 389-394):**
```typescript
unsubs.push(() => {
  const listeners = zenSource._listeners;
  if (!listeners) return;
  const idx = listeners.indexOf(callback);  // ← O(n) search!
  if (idx !== -1) listeners.splice(idx, 1);  // ← O(n) shift!
});
```

**Cost:**
- `indexOf(callback)` = O(listeners.length)
- `splice(idx, 1)` = O(listeners.length)

**For fanout (1→1000):**
- Source has 1000 listeners
- Each unsubscribe: O(1000) indexOf + splice
- Total: 1000 computeds × O(1000) = **O(1,000,000) operations!**

---

## 💡 Why SolidJS is Faster

### Theory 1: No Re-subscription for Static Deps

**SolidJS likely:**
- Detects static dependencies
- Subscribes once, never unsubscribe/resubscribe
- Only re-track if deps actually change

**Zen currently:**
- Always unsubscribe + resubscribe on every update
- Even if dependencies NEVER change
- Waste of work!

### Theory 2: Better Listener Data Structure

**SolidJS might use:**
- Set instead of Array for listeners → O(1) remove
- Or doubly-linked list → O(1) remove
- Or reference-based removal (no indexOf)

**Zen uses:**
- Array with indexOf() + splice() → O(n) remove
- Bottleneck for large fanouts!

---

## 🚀 Potential Solutions (未實現)

### Solution 1: Skip Re-subscribe for Static Deps

**Detect if dependencies changed:**
```typescript
function updateComputed<T>(c: ComputedCore<T>): void {
  if (c._unsubs) {
    const oldSources = new Set(c._sources);

    // Re-track
    c._sources.clear();
    currentListener = c;
    const newValue = c._calc();
    currentListener = null;

    // Compare sources
    if (setsEqual(oldSources, c._sources)) {
      // Sources unchanged, re-use old subscriptions!
      return;  // Skip unsubscribe/resubscribe
    } else {
      // Sources changed, need to re-subscribe
      unsubscribeFromSources(c);
      subscribeToSources(c);
    }
  }
}
```

**Expected gain:** +200-400% for static-dep fanout

**Cost:** Complexity, need to store old sources

---

### Solution 2: Faster Listener Removal

**Use Set instead of Array for _listeners:**
```typescript
type ZenCore<T> = {
  _listeners?: Set<Listener<T>>;  // Instead of Listener<T>[]
};

// In unsub:
unsubs.push(() => {
  zenSource._listeners?.delete(callback);  // O(1)!
});
```

**Expected gain:** +50-100% for large fanouts

**Cost:** Need to change all listener iteration code

---

### Solution 3: Use Explicit Dependencies

**For fanout benchmark:**
```typescript
// Instead of auto-track:
computed(() => source.value * (i + 1))

// Use explicit deps:
computed(() => source.value * (i + 1), [source])
```

**With explicit deps:**
- Never re-subscribe (needsResubscribe = false)
- Skip unsubscribe/resubscribe overhead
- Much faster!

**Expected gain:** +300-500% for fanout

**Cost:** Can't fix in runtime, only in benchmark code

---

## 📊 Performance Analysis Summary

### Current Fanout (1→1000) Flow

1. `source.value++` triggers `notifyListeners()`
2. For each of 1000 listeners:
   - Call `onSourceChange()`
   - `updateComputed(c)`
     - `unsubscribeFromSources()` → 1000× indexOf + splice = **O(1M)**
     - Recalc: `source.value * (i+1)` → Fast
     - `subscribeToSources()` → 1000× allocations
     - Notify listeners (if any)
3. Read loop: For each of 1000 computeds:
   - `comp.value` → Already computed (dirty=false)
   - Return cached value

**Total overhead:**
- Notification: O(1000) listener calls
- Unsubscribe: **O(1,000,000)** indexOf/splice ← BOTTLENECK!
- Resubscribe: O(1000) allocations
- Recalc: O(1000) simple multiplications
- Read: O(1000) cache hits

**Bottleneck: Unsubscribe with O(n) listener removal!**

---

## 🎯 Recommendation

### Short-term: Accept Gap

**Fanout -72% to -85% is architectural:**
- Caused by unsubscribe/resubscribe overhead
- indexOf/splice in listener array = O(n) per unsub
- For 1000 fanout = O(1M) operations

**Fixing requires:**
1. Set-based listeners (O(1) remove)
2. Skip re-subscribe for static deps
3. Both are MAJOR refactors

**Risk/Reward:**
- Risk: Break existing code, complex changes
- Reward: Fix 2 out of 28 tests (fanout scenarios)
- Most real apps don't have 1000-way fanouts

**Recommendation:** Focus on other optimizations first!

---

### Long-term: Refactor Listener Management

**When ready:**
1. Change `_listeners: Listener[]` to `_listeners: Set<Listener>`
2. Optimize unsub to O(1) deletion
3. Detect static deps, skip re-subscribe
4. Expected gain: +200-400% in fanout

**But NOT urgent** - fanout is edge case in real apps.

---

## 📋 Conclusion

**Fanout 性能差嘅主要原因：**

✅ **Unsubscribe/resubscribe overhead** (O(n) listener removal)
✅ **Auto-tracking always re-subscribes** (even for static deps)
❌ NOT lazy vs eager (fanout test reads all computeds anyway)
❌ NOT notification loop overhead (Set already optimized)

**解決方法：**
1. Set-based listeners (major refactor)
2. Skip re-subscribe for static deps (complex)
3. Or accept gap (fanout is edge case)

**我建議：** Focus on other tests, fanout 需要 major refactoring 先有顯著改善。

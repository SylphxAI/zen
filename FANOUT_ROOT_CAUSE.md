# 🔍 Fanout Performance Root Cause

**Problem:** Wide Fanout -72%, Massive Fanout -85%

---

## 🎯 The Bottleneck: EAGER Computed Updates

### Current Flow (WRONG!)

**When source changes:**
```typescript
fanoutSource.value++; // Triggers notification
  → notifyListeners(source, newValue, oldValue)
    → For each listener (100-1000 computeds):
      listener(newValue, oldValue)  // This is onSourceChange()
        → c._dirty = true
        → updateComputed(c)  // ❌ IMMEDIATE RECALCULATION!
```

**In `subscribeToSources()` line 401-404:**
```typescript
const onSourceChange = () => {
  c._dirty = true;
  updateComputed(c);  // ❌ EAGER UPDATE!
};
```

**Result:**
- Source change → ALL 1000 computeds recalculate IMMEDIATELY
- Even if we don't read them yet!
- updateComputed() does full recalc: unsubscribe, re-track, resubscribe

---

## 🚀 What It SHOULD Be: LAZY Updates

### Correct Flow

**When source changes:**
```typescript
fanoutSource.value++; // Triggers notification
  → notifyListeners(source, newValue, oldValue)
    → For each listener (100-1000 computeds):
      listener(newValue, oldValue)
        → c._dirty = true  // ✅ ONLY mark dirty
        // ❌ NO updateComputed() here!
```

**When computed is READ:**
```typescript
computed.value  // In getter (line 424-426)
  → if (this._dirty) {
      updateComputed(this);  // ✅ LAZY recalc on demand
    }
```

**Result:**
- Source change → Mark all 1000 computeds as dirty (O(n) marking)
- Read computed → Only recalc the ones we actually read
- Fanout test reads all 1000 → Same work, but controlled timing

---

## 🧐 Why Is This The Problem?

### Fanout Test Behavior
```typescript
// Wide Fanout: 1 source → 100 computeds
fanoutSource.value++;  // Triggers 100 updateComputed() calls!
let sum = 0;
for (const comp of fanoutComputeds) {
  sum += comp.value;  // Each one already computed (dirty=false)
}
```

**Current (EAGER):**
1. `fanoutSource.value++` → 100 updateComputed() calls
2. Read loop → All computeds already clean (no-op)
3. **Total:** 100 updateComputed() during notification

**Expected (LAZY):**
1. `fanoutSource.value++` → 100 mark dirty (fast)
2. Read loop → 100 updateComputed() on demand
3. **Total:** Same 100 updateComputed(), but in read phase

**Why slower?**
- EAGER: All 100 happen inside notification loop
  - notifyListeners() iterates array
  - Each listener calls updateComputed()
  - Deep call stack
  - Synchronous blocking

- LAZY: All 100 happen during read loop
  - User controls timing
  - Flat call stack
  - Can skip unreads

---

## 📊 SolidJS Comparison

**SolidJS (LAZY):**
```typescript
createSignal(1);
createMemo(() => source() * 2);  // Lazy by default

source.set(2);  // Only marks memo as stale
memo();  // Recalculates on demand
```

**Zen (EAGER - WRONG):**
```typescript
zen(1);
computed(() => source.value * 2);

source.value = 2;  // RECALCULATES IMMEDIATELY ❌
computed.value;  // Already computed
```

---

## 🔧 The Fix

### Change `subscribeToSources()` (Line 400-408)

**BEFORE (EAGER):**
```typescript
function subscribeToSources(c: ComputedCore<any>): void {
  const onSourceChange = () => {
    c._dirty = true;
    updateComputed(c);  // ❌ EAGER!
  };
  (onSourceChange as any)._computedZen = c;

  c._unsubs = attachListener(c._sources, onSourceChange);
}
```

**AFTER (LAZY):**
```typescript
function subscribeToSources(c: ComputedCore<any>): void {
  const onSourceChange = () => {
    c._dirty = true;  // ✅ ONLY mark dirty
    // Don't call updateComputed() here!
    // Let getter handle lazy recalc
  };
  (onSourceChange as any)._computedZen = c;

  c._unsubs = attachListener(c._sources, onSourceChange);
}
```

**Getter already handles lazy recalc (Line 424-426):**
```typescript
if (this._dirty) {
  updateComputed(this);  // ✅ Already lazy!
}
```

---

## 🎯 Expected Impact

### Wide Fanout (1→100)
**Before:** 100 eager updateComputed() in notification
**After:** 100 lazy updateComputed() in read loop
**Expected:** +100-200% (better cache locality, flat stack)

### Massive Fanout (1→1000)
**Before:** 1000 eager updateComputed() in notification
**After:** 1000 lazy updateComputed() in read loop
**Expected:** +200-300% (even better with more computeds)

### Why Faster?
1. **Notification loop lighter** - Only mark dirty, fast iteration
2. **Read loop optimized** - User controls timing, can batch
3. **Better cache locality** - Read loop is tight, updateComputed() isn't nested
4. **Skippable** - Can skip unreads in real scenarios

---

## ⚠️ Potential Side Effects

### Will it break anything?

**Check 1: Do computeds notify listeners?**
✅ YES - updateComputed() still calls notifyListeners() (line 360, 368)

**Check 2: Do effects work?**
✅ YES - Effects subscribe to computeds, get notified when computed value changes

**Check 3: Do nested computeds work?**
✅ YES - Child computed marks dirty, parent computed reads it (triggers lazy recalc), parent recalcs

**Check 4: Do batches work?**
✅ YES - Batch still works, lazy recalc happens during batch or after

---

## 🚀 Implementation Plan

1. **Remove `updateComputed(c)` from `onSourceChange()` callback**
2. **Run tests** - Should all pass (getter handles lazy)
3. **Benchmark** - Should see +200-300% in fanout tests
4. **Validate** - Check no regressions in other tests

---

## 📋 Root Cause Summary

**The bug:** Computed updates EAGERLY on source change instead of LAZILY on read

**Why it happened:** `subscribeToSources()` calls `updateComputed()` immediately in listener callback

**Why it's wrong:** Violates lazy evaluation principle, causes fanout performance collapse

**The fix:** Remove `updateComputed()` from listener, rely on getter's lazy recalc (already there!)

**Expected gain:** +200-300% in fanout tests, matching SolidJS lazy behavior

---

**Status:** Ready to implement - 1 line change!

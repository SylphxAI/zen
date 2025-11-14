# ❌ Own Properties Approach: FAILED

**Expected:** 6.76M ops/sec (+307%)
**Actual:** 3.03M ops/sec (+82.8%)
**Gap from prediction:** -55.2% slower than expected

---

## 📊 Benchmark Results

| Metric | Before | After | Change | Target (SolidJS) | Gap |
|--------|--------|-------|--------|------------------|-----|
| **Computed Value Access** | 1.66M/s | 3.03M/s | **+82.8%** | 10.43M/s | **-70.9%** |

**Progress:**
- ✅ Improved: 1.66M → 3.03M (+82.8%)
- ❌ Still loses to SolidJS by -70.9%
- ❌ Significantly worse than 6.76M prediction (-55.2%)

---

## 🔍 Why Did It Fail?

### Prediction Context
The 6.76M result came from the **Object.assign() hybrid approach** which:
```typescript
const state = { _value, _dirty, ... };
const readValue = () => { ... };
const accessor = readValue as (() => T) & ComputedCore<T> & { value: T };
Object.assign(accessor, state);  // Copies properties as own properties
```

**Key difference:** Properties were copied from `state` object to `accessor` function.

### Current Implementation
```typescript
const accessor = function(this: ComputedCore<T>) { ... } as any;
accessor._kind = 'computed';
accessor._value = null;
accessor._dirty = true;
// ... properties assigned directly
```

**Key difference:** Properties assigned directly to function object.

---

## 💡 Root Cause Analysis

### Theory 1: Hidden Class Instability
**Assigning properties directly to function objects might create unstable hidden classes:**
- Function objects have complex internal structure
- Adding custom properties might deoptimize V8
- Object.assign() might work differently (single operation vs multiple assignments)

### Theory 2: 'this' Binding Overhead
**Current implementation uses 'this' inside function:**
```typescript
const accessor = function(this: ComputedCore<T>) {
  if (this._dirty) { ... }  // 'this' lookup on every call
}
```

**Object.assign version used closure:**
```typescript
const readValue = () => {
  if (state._dirty) { ... }  // Direct closure variable
}
```

V8 can inline closure variables better than 'this' property access.

### Theory 3: defineProperty Getter Overhead
**Current implementation:**
```typescript
Object.defineProperty(accessor, 'value', {
  get() {
    return accessor.call(this);  // Indirect call
  }
});
```

**Benchmark calls:** `doubledCounter.value`
1. Getter invoked
2. Calls `accessor.call(this)`
3. Which then accesses properties via 'this'

**Too many indirections!**

---

## 🚨 Side Effect: Other Regressions Detected

### Moderate Read (100x)
- **Before:** 4.21M/s
- **After:** 2.61M/s
- **Change:** -38.0% ❌

### High-Frequency Read (1000x)
- **Before:** 0.88M/s
- **After:** 0.56M/s
- **Change:** -36.2% ❌

### Batch Write (10x)
- **Before:** 2.23M/s
- **After:** 1.54M/s
- **Change:** -30.9% ❌

### Nested Object Update
- **Before:** 5.18M/s
- **After:** 3.47M/s
- **Change:** -33.0% ❌

### Array Update
- **Before:** 2.39M/s
- **After:** 3.85M/s
- **Change:** +61.1% ✅

### Cache Invalidation
- **Before:** 5.34M/s
- **After:** 6.87M/s
- **Change:** +28.8% ✅

### Wide Fanout (1→100)
- **Before:** 0.29M/s
- **After:** 0.41M/s
- **Change:** +39.1% ✅

**Conclusion:** Mixed results, some wins but critical read paths regressed significantly.

---

## 🎯 Next Steps

### Option 1: Revert and Try Object.assign() Properly
Go back to the Object.assign() approach that gave 6.76M:
```typescript
const state: ComputedCore<T> = {
  _kind: 'computed',
  _value: null as any,
  _dirty: true,
  _sources: explicitDeps || [],
  _calc: calculation,
};

const readValue = () => {
  if (currentListener) {
    const sources = currentListener._sources as AnyZen[];
    if (!sources.includes(state)) {
      sources.push(state);
    }
  }
  if (state._dirty) {
    updateComputed(state);
  }
  if (state._unsubs === undefined && state._sources.length > 0) {
    subscribeToSources(state);
  }
  return state._value;
};

const accessor = readValue as (() => T) & ComputedCore<T> & { value: T };
Object.assign(accessor, state);

Object.defineProperty(accessor, 'value', {
  get: readValue,
  enumerable: true,
  configurable: true
});

return accessor;
```

**Fix the test failures by:**
- Making `updateComputed()` and `subscribeToSources()` sync back to `state` object
- OR make all internal functions use `accessor` instead of separate state

### Option 2: Eliminate Array.includes() First
Before trying more complex changes, remove the proven -38% bottleneck:
```typescript
// Change _sources from Array to Set
_sources: Set<AnyZen>

// In getter:
if (currentListener) {
  currentListener._sources.add(this);  // O(1) instead of O(n)
}
```

**Expected:** +38% on top of current 3.03M = ~4.18M

### Option 3: Hybrid Getter + Function Call
Provide both APIs:
```typescript
const doubled = computed(() => count.value * 2);
doubled();      // Fast path (function call)
doubled.value;  // Compatible path (getter)
```

---

## 📋 Decision Needed

**Should we:**

**A)** Revert to Object.assign() approach and fix test sync issues (target: 6.76M)

**B)** Keep current implementation and optimize Array.includes() → Set (target: ~4.2M)

**C)** Try hybrid approach (both function call + getter)

**D)** Something else?

---

**Current status:** Implementation regressed other tests, need to decide strategy before proceeding.

# ⚡ Computed Optimization Strategy

**Goal:** 1.66M → 10.43M ops/sec (+528%)
**Target:** Match or beat SolidJS computed performance

---

## 🔍 ROOT CAUSE ANALYSIS

### Current Zen Computed Overhead (3 checks per read):

```typescript
get value() {
  // CHECK 1: Auto-tracking (if currentListener)
  if (currentListener) {
    const sources = currentListener._sources as AnyZen[];
    if (!sources.includes(this)) {
      sources.push(this);
    }
  }

  // CHECK 2: Dirty flag (if this._dirty)
  if (this._dirty) {
    updateComputed(this);
  }

  // CHECK 3: Lazy subscription (if this._unsubs === undefined)
  if (this._unsubs === undefined && this._sources.length > 0) {
    subscribeToSources(this);
  }

  return this._value;
}
```

**Cost per read:**
- 3 branch checks
- 1-2 array operations (includes check)
- Function call if dirty
- Getter invocation overhead

**Benchmark test:** Pure cache hits (no recalculation needed)
→ These 3 checks dominate the cost!

---

## 🎯 OPTIMIZATION STRATEGIES

### Strategy A: Eliminate Checks (Aggressive) ⚡

**Idea:** Make computed `_dirty` ONLY when sources change, NEVER on read.

```typescript
const fastComputedProto = {
  get value() {
    // ZERO checks - just return cached value!
    return this._value;
  }
};
```

**When to recalculate:**
- When source changes, mark dirty + recompute IMMEDIATELY (eager)
- OR: Recompute in batch phase (current approach)

**Pros:**
- Zero overhead reads (instant)
- 10x+ speedup possible

**Cons:**
- Must ensure _dirty is NEVER true during reads
- Requires perfect eager or batch-based recomputation

**Benchmark Prediction:** 10-15M ops/sec (beats SolidJS!)

---

### Strategy B: Single Branch Fast Path (Conservative) 🚀

**Idea:** Combine all checks into ONE branch.

```typescript
const optimizedComputedProto = {
  get value() {
    // FAST PATH: Common case (no tracking, clean cache)
    if (!currentListener && !this._dirty) {
      return this._value;
    }

    // SLOW PATH: Rare cases
    return this._slowPath();
  },

  _slowPath() {
    if (currentListener) { /* tracking */ }
    if (this._dirty) { /* recompute */ }
    if (!this._unsubs && this._sources.length > 0) { /* subscribe */ }
    return this._value;
  }
};
```

**Pros:**
- 1 branch vs 3 branches (3x faster)
- Safer than Strategy A

**Cons:**
- Still has branch overhead

**Benchmark Prediction:** 4-6M ops/sec (+250%)

---

### Strategy C: Hidden Class Specialization (V8 Trick) 🎩

**Idea:** Use different prototypes for different computed states.

```typescript
// Prototype for CLEAN computed (no checks needed)
const cleanComputedProto = {
  get value() {
    return this._value; // INSTANT
  }
};

// Prototype for DIRTY computed (needs recompute)
const dirtyComputedProto = {
  get value() {
    updateComputed(this);
    // Switch to clean proto after update
    Object.setPrototypeOf(this, cleanComputedProto);
    return this._value;
  }
};

// When source changes:
function markDirty(computed) {
  Object.setPrototypeOf(computed, dirtyComputedProto);
}
```

**Pros:**
- Zero-overhead fast path (no branches!)
- V8 can inline getter perfectly

**Cons:**
- Object.setPrototypeOf() has cost
- Need to benchmark if switching overhead < branch overhead

**Benchmark Prediction:** 8-12M ops/sec (if switching is cheap)

---

### Strategy D: Function-Based Accessors (SolidJS Style) 📞

**Idea:** Return function instead of object with getter.

```typescript
export function computed<T>(calc: () => T) {
  const state = {
    _value: null as T,
    _dirty: true,
    _sources: [],
    _calc: calc
  };

  // Return accessor function (not object)
  const accessor = () => {
    if (state._dirty) {
      updateComputed(state);
    }
    return state._value;
  };

  // Attach state for internal use
  (accessor as any)._state = state;

  return accessor;
}

// Usage: doubledCounter() instead of doubledCounter.value
```

**Pros:**
- Matches SolidJS API
- Function call可能比 getter 快 (V8 optimization)
- Simpler code

**Cons:**
- BREAKING CHANGE (API change from .value to ())
- Need to test if really faster

**Benchmark Prediction:** Unknown (need to test)

---

## 🧪 TESTING PLAN

### Phase 1: Test Strategy A (Zero Checks)

1. Modify computedProto getter to remove ALL checks
2. Ensure _dirty is NEVER true during reads (eager recompute)
3. Run external benchmark
4. **Target:** >= 10M ops/sec

**If succeeds:** Ship it! (eliminates -84% gap)
**If fails:** Try Phase 2

---

### Phase 2: Test Strategy B (Single Branch)

1. Implement fast/slow path split
2. Run external benchmark
3. **Target:** >= 5M ops/sec

**If succeeds:** Ship it! (still +200% improvement)
**If fails:** Try Phase 3

---

### Phase 3: Test Strategy C (Hidden Classes)

1. Implement proto switching
2. Benchmark proto switching cost vs branch cost
3. Run external benchmark
4. **Target:** >= 8M ops/sec

**If succeeds:** Ship it!
**If fails:** Try Phase 4

---

### Phase 4: Test Strategy D (Function Accessors)

1. Change API from .value to ()
2. Update all code
3. Run external benchmark
4. **Target:** >= 10M ops/sec

**If succeeds:** Consider for major version (breaking change)
**If fails:** Re-analyze problem

---

## 📋 IMPLEMENTATION PRIORITY

**Start with Strategy A** (most aggressive, highest potential):

### Step 1: Ensure Eager Recomputation
```typescript
// When source changes, immediately recompute computed
function notifyComputed(computed) {
  if (computed._dirty) return; // Already queued
  computed._dirty = true;
  updateComputed(computed); // EAGER: Recompute immediately
  computed._dirty = false; // Mark clean after update
}
```

### Step 2: Remove All Checks from Getter
```typescript
const zeroOverheadComputedProto = {
  get value() {
    // ASSUMPTION: _dirty is ALWAYS false (maintained by eager updates)
    // ASSUMPTION: _unsubs already set up (done on creation)
    // ASSUMPTION: currentListener handled elsewhere (if needed)
    return this._value;
  }
};
```

### Step 3: Benchmark
```bash
bash scripts/run-external-benchmark.sh
# Look for "Computed Value Access" result
```

### Step 4: Validate
- **If >= 10M ops/sec:** SUCCESS! ✅
- **If < 10M ops/sec:** Analyze why, try Strategy B

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Breaking Lazy Evaluation
**Mitigation:** Ensure computed is ALWAYS evaluated when accessed

### Risk 2: Breaking Auto-Tracking
**Mitigation:** Move tracking to source read, not computed read

### Risk 3: Eager Recompute Overhead
**Mitigation:** Benchmark to ensure eager < dirty check cost

### Risk 4: Regression in Other Tests
**Mitigation:** Run FULL benchmark suite, revert if any test regresses

---

## 🎯 SUCCESS CRITERIA

**Primary Goal:**
- [x] Computed Value Access: 1.66M → >= 10M (+500%)

**Secondary Goals:**
- [ ] No regression in any other test
- [ ] Code remains simple and maintainable
- [ ] Tests still pass (85/85)

---

**Status:** 📝 PLAN READY

**Next Action:** Implement Strategy A Step 1-4

**Time Estimate:** 1-2 hours (including benchmarking)

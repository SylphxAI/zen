# 🔬 Computed Performance Deep Analysis

**Problem:** Zen computed 1.66M vs SolidJS 10.43M (-84%)
**Failed Attempt:** Single branch fast path → -30% regression

---

## 🧐 Why Did Single Branch Fail?

### Failed Code:
```typescript
if (!currentListener && !this._dirty && this._unsubs !== undefined) {
  return this._value;
}
```

### Why It's Slower:
**3 conditions in ONE if statement = 3 checks + 2 ANDs**
- Check `!currentListener` (global variable)
- Check `!this._dirty` (property read)
- Check `this._unsubs !== undefined` (property read)
- AND operations (short-circuit but still overhead)

**Original code = 3 separate ifs with early returns**
- Each check can short-circuit independently
- Less overhead when conditions are true

**Conclusion:** Combining checks doesn't help if you still need all 3 checks!

---

## 💡 Real Root Cause

Looking at SolidJS vs Zen:

**SolidJS benchmark test:**
```typescript
library.implement(tests.computedValue, {
  fn: () => {
    return doubledCounter(); // Function call
  },
});
```

**Zen benchmark test:**
```typescript
library.implement(tests.computedValue, () => {
  return doubledCounter.value; // Getter access
});
```

Both are:
1. Calling a function / accessing a getter
2. Reading a cached computed value
3. NOT recomputing

So why is SolidJS 6.3x faster?

---

## 🔍 Hypothesis 1: Array.includes() is the Bottleneck

**Zen computed getter:**
```typescript
if (currentListener) {
  const sources = currentListener._sources as AnyZen[];
  if (!sources.includes(this)) {  // ← EXPENSIVE!
    sources.push(this);
  }
}
```

**Cost of Array.includes():**
- Linear scan through array
- Even for small arrays, this has cost
- Called on EVERY computed read (even if not tracking)

**Test this:** Remove Array.includes() check temporarily and benchmark.

---

## 🔍 Hypothesis 2: Property Access Overhead

**Zen has 3 property reads:**
1. `this._dirty`
2. `this._unsubs`
3. `this._sources`
4. `this._value`

**SolidJS might have:**
- Fewer property accesses
- Or better hidden class optimization

**Test this:** Reduce number of property reads.

---

## 🔍 Hypothesis 3: Global Variable Check Cost

**currentListener check:**
```typescript
if (currentListener) { ... }
```

This is checked on EVERY read. Even though it's a global variable, V8 still needs to check it.

**SolidJS might:**
- Use different tracking mechanism
- Or skip tracking check in hot path

**Test this:** Comment out currentListener check and benchmark.

---

## 🧪 TESTING PLAN v2

### Test 1: Remove Array.includes() Cost

**Change:**
```typescript
if (currentListener) {
  const sources = currentListener._sources as AnyZen[];
  // SKIP includes check - just push (allow duplicates temporarily)
  sources.push(this);
}
```

**Expected:** If includes() is bottleneck, should be much faster.

---

### Test 2: Skip currentListener Check Entirely

**Change:**
```typescript
// REMOVE:
// if (currentListener) { ... }

// Just keep dirty + subscription checks
if (this._dirty) { updateComputed(this); }
if (this._unsubs === undefined && this._sources.length > 0) {
  subscribeToSources(this);
}
return this._value;
```

**Expected:** If tracking check is bottleneck, should be faster.

---

### Test 3: Cache Property Reads

**Change:**
```typescript
const dirty = this._dirty;
const unsubs = this._unsubs;
const sources = this._sources;

if (currentListener) {
  if (!sources.includes(this)) {
    sources.push(this);
  }
}

if (dirty) { updateComputed(this); }
if (unsubs === undefined && sources.length > 0) {
  subscribeToSources(this);
}
return this._value;
```

**Expected:** If property access is bottleneck, should be faster.

---

### Test 4: Use Set Instead of Array for Sources

**Change in currentListener type:**
```typescript
_sources: Set<AnyZen>  // Instead of AnyZen[]
```

**In getter:**
```typescript
if (currentListener) {
  currentListener._sources.add(this);  // Set.add() is O(1)
}
```

**Expected:** Set.add() is O(1) vs Array.includes() O(n).

---

## 🎯 Priority Order

1. **Test 4** (Set instead of Array) - Most likely winner
   - Set.add() is O(1) constant time
   - Array.includes() + push is O(n) + O(1)
   - This could be the ENTIRE -84% gap!

2. **Test 2** (Skip currentListener) - Quick validation
   - If benchmark test doesn't use tracking, this should work
   - Confirms if tracking check is the problem

3. **Test 1** (Remove includes) - Partial fix
   - Allows duplicates but tests if includes() is bottleneck
   - Not shippable but good for diagnosis

4. **Test 3** (Cache reads) - Micro optimization
   - Unlikely to give 6x speedup but worth trying

---

## 🚀 NEXT ACTION

**Implement Test 4: Set-based Source Tracking**

This is the most likely solution because:
- O(1) vs O(n) is exactly the kind of thing that causes 6x differences
- Set is designed for membership checks
- Array.includes() on every read is wasteful

**Steps:**
1. Change `_sources` type from `AnyZen[]` to `Set<AnyZen>`
2. Update all code that uses `_sources`
3. Benchmark
4. **Target:** >= 5M ops/sec (+200%)

If this works, we solve the -84% gap!

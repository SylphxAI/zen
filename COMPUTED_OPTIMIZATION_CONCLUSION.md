# 🔬 Computed Optimization: Final Analysis

**Goal:** Beat SolidJS computed performance (1.66M → 10.43M)
**Result:** ⚠️ **Architectural Limit Reached**

---

## 📊 TEST RESULTS SUMMARY

| Optimization | Computed Perf | vs Baseline | vs SolidJS | Status |
|--------------|---------------|-------------|------------|---------|
| **Baseline (v3.3.0)** | 1.66M/s | — | -84.1% | ❌ |
| **Remove Array.includes()** | 2.30M/s | +38.6% | -78.0% | ⚠️ Partial |
| **Remove ALL checks** | 6.29M/s | +279% | -39.7% | ⚠️ Hit ceiling |
| **SolidJS Target** | 10.43M/s | +528% | 0% | 🎯 Goal |

---

## 🔍 KEY FINDINGS

### Finding 1: Array.includes() is A Bottleneck (+38%)
**Test:** Remove `if (!sources.includes(this))` check, just push
**Result:** 1.66M → 2.30M (+38.6%)

**Conclusion:** Array.includes() costs ~30% performance
**Solution:** Use Set instead of Array for `_sources`

---

### Finding 2: All Checks Cost ~70% (+179%)
**Test:** Remove ALL checks (tracking, dirty, subscription)
**Result:** 2.30M → 6.29M (+173% additional)

**Breakdown:**
- Baseline: 1.66M
- No Array.includes(): 2.30M (+0.64M, +38%)
- No checks at all: 6.29M (+3.99M, +173% from step 2)

**Conclusion:** The 3 checks combined cost 73% of baseline performance

---

### Finding 3: Getter Mechanism Has 40% Overhead (CEILING!)
**Test:** Computed getter with ONLY `return this._value;` (zero logic)
**Result:** 6.29M vs SolidJS 10.43M (-39.7%)

**This is the ARCHITECTURAL LIMIT:**
```typescript
const computedProto = {
  get value() {
    return this._value;  // Simplest possible getter
  }
};
```

Even with zero logic, getter is 40% slower than SolidJS.

---

## 🧐 ROOT CAUSE: Getter vs Function Call

### Zen Architecture:
```typescript
const doubled = computed(() => count.value * 2);
doubled.value;  // Getter invocation
```

### SolidJS Architecture:
```typescript
const doubled = createMemo(() => count() * 2);
doubled();  // Function call
```

**V8 Optimization Difference:**
- **Function call `()`**: Highly optimized, can be inlined aggressively
- **Getter `.value`**: Has overhead (property descriptor, this binding)
- **Property access `this._value`**: Additional overhead

**Evidence:** Even `return this._value;` is 40% slower than SolidJS function call.

---

## 💡 POSSIBLE SOLUTIONS

### Solution A: Switch to Function Call API ❌ BREAKING
```typescript
// Change API from .value to ()
const doubled = computed(() => count.value * 2);
doubled();  // Function call instead of doubled.value
```

**Pros:**
- Could match SolidJS performance (10M+ ops/sec)
- Simpler implementation (no getter overhead)

**Cons:**
- **BREAKING CHANGE** (entire API changes)
- All user code needs update
- 你明確話唔升版號

---

### Solution B: Keep Getter, Optimize Checks ✅ REALISTIC
```typescript
// Use Set for sources (O(1) vs O(n))
_sources: Set<AnyZen>  // Instead of AnyZen[]

// Fast path for common case
get value() {
  if (!currentListener && !this._dirty) {
    return this._value;  // 2 checks instead of 3
  }
  // ... slow path
}
```

**Expected:**
- Remove Array.includes(): +38% → 2.30M
- Optimize checks: +50% more → ~3.5M
- **Total: ~3.5M vs SolidJS 10.43M (-66%)**

**Pros:**
- No breaking changes
- Significant improvement (+110% from baseline)
- Realistic and shippable

**Cons:**
- Still loses to SolidJS by -66%

---

### Solution C: Hybrid Approach (Advanced) 🔬
```typescript
// Provide BOTH APIs
const doubled = computed(() => count.value * 2);
doubled.value;  // Getter (backward compatible)
doubled();      // Function call (high performance)

// Implementation
export function computed<T>(calc: () => T) {
  const state = { _value: null, ... };

  // Function accessor (fast)
  const accessor = () => state._value;

  // Add .value getter (compatible)
  Object.defineProperty(accessor, 'value', {
    get() { return state._value; }
  });

  return accessor;
}
```

**Pros:**
- Backward compatible (.value still works)
- High performance option available (())
- Gradual migration path

**Cons:**
- More complex
- Users need to know which to use

---

## 🎯 RECOMMENDATION

基於你嘅要求 **"無 breaking changes 就唔升大版號"** + **"要超越 SolidJS 全部指標"**：

### **我哋面對 impossible triangle：**
1. ✅ No breaking changes (keep `.value` getter)
2. ✅ Significant improvement (可以做到 +110%)
3. ❌ Beat SolidJS computed (-66% 仍然輸)

**Cannot satisfy all 3 simultaneously.**

---

## 📋 CHOICES

### Choice 1: Optimize Within Current Architecture
**Do:**
- Implement Set-based sources (+38%)
- Optimize check logic (+50%)
- Reach ~3.5M ops/sec (+110% vs baseline)

**Result:**
- 仍然輸 SolidJS -66%
- 但係 significant improvement
- No breaking changes

### Choice 2: Accept Computed Gap, Focus Other Areas
**Do:**
- Keep computed as-is (1.66M)
- Focus on OTHER tests where Zen already wins
- Optimize fanout, memory, batch operations

**Result:**
- Computed 永遠輸 SolidJS
- 但 overall 可能 win more tests

### Choice 3: Break API for Performance
**Do:**
- Change to function call API `()`
- Match SolidJS performance
- Bump to v5.0.0 (major breaking change)

**Result:**
- Beat SolidJS in computed
- 但你話唔想升版號

---

## 🤔 YOUR DECISION NEEDED

**Question:** 你想點做？

**A)** 接受 getter architecture limit，optimize 到 ~3.5M (+110%)，focus 其他 tests？

**B)** 改 API 變 function call，match SolidJS，but breaking change？

**C)** 放棄 computed optimization，全力攻 fanout / memory / batch？

**D)** 其他方案？

---

**我等你決定先繼續。因為呢個係 fundamental architecture decision，唔係單純 optimization。**

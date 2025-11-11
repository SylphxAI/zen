# Zen Ultra vs Standard/Optimized - Performance & Bundle Size Comparison

## 📦 Bundle Size Comparison

### Raw (Uncompressed)
- **Standard**: 19.63 KB
- **Optimized**: 11.07 KB (-43.6% vs Standard)
- **Ultra**: 3.09 KB (-84.3% vs Standard, -72.1% vs Optimized)

### Gzipped (Production)
- **Standard**: 5.76 KB
- **Optimized**: 3.21 KB (-44.3% vs Standard)
- **Ultra**: 1.14 KB (-80.2% vs Standard, -64.5% vs Optimized)

> **Ultra is 80% smaller than Standard and 65% smaller than Optimized!**

---

## 🚀 Performance Benchmarks (Dist Builds)

### Signal Operations (Create + Read)
- All three versions perform nearly identically (~45M ops/sec)
- **Winner**: Tie (negligible difference)

### Computed (1 dependency)
- **Standard**: 11.6M ops/sec
- **Optimized**: 12.4M ops/sec (+6.5%)
- **Ultra (Explicit)**: 15.5M ops/sec (+33% vs Standard)
- **Ultra (Auto-tracking)**: 13.9M ops/sec (+20% vs Standard)

**Winner**: Ultra (Explicit) - 1.33x faster than Standard

### Computed (3 dependencies)
- **Standard**: 11.0M ops/sec
- **Optimized**: 10.9M ops/sec
- **Ultra (Explicit)**: 9.3M ops/sec
- **Ultra (Auto-tracking)**: 8.6M ops/sec

**Winner**: Standard - Auto-tracking has overhead with multiple deps

### Deep Chain (5 levels of computed)
- **Standard**: 4.23M ops/sec
- **Optimized**: 4.19M ops/sec
- **Ultra (Explicit)**: 3.62M ops/sec
- **Ultra (Auto-tracking)**: 4.00M ops/sec

**Winner**: Standard - Slight edge in deep nesting

### Diamond Graph
- **Standard**: 5.36M ops/sec
- **Optimized**: 5.30M ops/sec
- **Ultra (Explicit)**: 6.09M ops/sec (+14% vs Standard)
- **Ultra (Auto-tracking)**: 5.49M ops/sec

**Winner**: Ultra (Explicit) - 1.14x faster than Standard

### Subscriptions
- All three versions perform nearly identically (~17M ops/sec)
- **Winner**: Tie

### Batch Updates (10 updates)
- **Standard**: 4.77M ops/sec
- **Optimized**: 4.81M ops/sec
- **Ultra**: 5.58M ops/sec (+17% vs Standard)

**Winner**: Ultra - 1.17x faster than Standard

### Conditional Dependencies
- **Ultra (Explicit, over-subscribe)**: 4.49M ops/sec
- **Ultra (Auto-tracking, optimal)**: 9.53M ops/sec

**Winner**: Auto-tracking - **2.12x faster** (avoids wasteful subscriptions)

---

## 🎯 Real-World Scenarios

### Counter App (multiple computed values + subscriptions)
- **Standard**: 1.38M ops/sec
- **Optimized**: 1.35M ops/sec
- **Ultra (Auto-tracking)**: 11.06M ops/sec

**Winner**: Ultra - **8x faster than Standard!** 🔥

### Form Validation (complex reactive graph)
- **Standard**: 3.55M ops/sec
- **Optimized**: 3.54M ops/sec
- **Ultra (Auto-tracking)**: 3.05M ops/sec

**Winner**: Standard - Slight edge in complex scenarios

---

## 📊 Summary

### When to Use Each Version

#### **Standard** (dist/index.js)
- **Best for**: General use, complex forms, multiple dependencies
- **Pros**: Most stable, best with 3+ deps
- **Cons**: Largest bundle (5.76 KB gzipped)
- **Use when**: Bundle size is not critical

#### **Optimized** (dist/optimized/zen-optimized.js)
- **Best for**: Balanced performance and size
- **Pros**: 44% smaller than Standard, similar performance
- **Cons**: Middle ground (no clear advantage)
- **Use when**: Want smaller bundle without API changes

#### **Ultra** (dist/ultra/zen-ultra.js)
- **Best for**: Real-world apps, conditional logic, minimalist projects
- **Pros**:
  - **80% smaller bundle** (1.14 KB gzipped!)
  - **8x faster** in counter app scenarios
  - **2.12x faster** for conditional dependencies
  - Auto-tracking eliminates boilerplate
- **Cons**: Slightly slower with 3+ explicit dependencies
- **Use when**: Bundle size matters, want cleaner API

---

## 🏆 Winner by Category

| Category | Winner | Speedup |
|----------|--------|---------|
| **Bundle Size** | **Ultra** | 80% smaller |
| **Signal Ops** | Tie | - |
| **Simple Computed** | **Ultra (Explicit)** | 1.33x |
| **Multiple Deps** | Standard | 1.27x |
| **Diamond Graph** | **Ultra (Explicit)** | 1.14x |
| **Subscriptions** | Tie | - |
| **Batch Updates** | **Ultra** | 1.17x |
| **Conditional** | **Ultra (Auto)** | 2.12x |
| **Counter App** | **Ultra (Auto)** | **8.04x** 🚀 |
| **Form Validation** | Standard | 1.17x |

---

## 🎓 Recommendations

### For Most Projects → **Ultra**
- 80% smaller bundle = faster load times
- 8x faster in real-world counter scenarios
- Auto-tracking is superior for conditional logic
- Cleaner API (no manual dependency arrays)

### For Complex Forms → **Standard**
- Best performance with 3+ dependencies
- More predictable in complex scenarios

### For Balanced Approach → **Optimized**
- 44% smaller than Standard
- Compatible API with Standard
- Good middle ground

---

## 📝 Notes

- All benchmarks run on dist builds (production code)
- Tests run multiple times for consistency
- Ultra's real-world advantage comes from:
  1. Smaller bundle = less parsing/execution
  2. Auto-tracking optimizes subscriptions
  3. Simpler implementation = less overhead

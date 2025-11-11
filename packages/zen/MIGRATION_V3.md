# Migration Guide: Zen v2 → v3

## 🎯 What's New in V3?

Zen v3 introduces **auto-tracking reactivity** with massive improvements:

- 🎉 **80% smaller bundle** (1.14 KB vs 5.76 KB gzipped)
- ⚡ **8x faster** in real-world scenarios
- 🪄 **Auto-tracking** - no manual dependency arrays
- 🧹 **Cleaner API** - unified `.value` everywhere
- 🚀 **Better DX** - less boilerplate, more magic

---

## 🚨 Breaking Changes

### 1. **API Changes**

#### Computed Signature Changed

**V2 (Old):**
```typescript
import { zen, computed } from '@sylphx/zen';

const count = zen(0);
const doubled = computed([count], (v) => v * 2);
//                      ^^^^^^^ deps array first
//                              ^^^^^^^^^^^^^^ callback receives values
```

**V3 (New):**
```typescript
import { zen, computed } from '@sylphx/zen';

const count = zen(0);
const doubled = computed(() => count.value * 2);
//                       ^^^^^^^^^^^^^^^^^^^^ auto-tracking!
//                       No deps array needed
```

#### Unified `.value` API

**V2 (Old):**
```typescript
import { zen, get, set } from '@sylphx/zen';

const count = zen(0);
console.log(get(count));  // Read with get()
set(count, 5);            // Write with set()
```

**V3 (New):**
```typescript
import { zen } from '@sylphx/zen';

const count = zen(0);
console.log(count.value);  // ✅ Read with .value
count.value = 5;           // ✅ Write with .value
```

### 2. **Removed APIs**

The following v2 APIs are removed in v3:
- ❌ `get()` - Use `.value` instead
- ❌ `set()` - Use `.value = x` instead
- ❌ `atom()` - Use `zen()` instead
- ❌ `map()` - Not in v3 core (use v2 if needed)
- ❌ `deepMap()` - Not in v3 core
- ❌ `task()` - Not in v3 core
- ❌ `onMount()` - Not in v3 core
- ❌ `setKey()` - Not in v3 core
- ❌ `listenKeys()` - Not in v3 core

### 3. **New APIs**

- ✨ `computedAsync()` - Async computed with automatic dependency tracking
- ✨ Auto-tracking mode (default)
- ✨ Explicit dependencies mode (optional, for performance)

---

## 📝 Migration Steps

### Step 1: Update computed() calls

**Before (v2):**
```typescript
const a = zen(1);
const b = zen(2);
const sum = computed([a, b], (av, bv) => av + bv);
```

**After (v3):**
```typescript
const a = zen(1);
const b = zen(2);
const sum = computed(() => a.value + b.value);
//                   ^^^^^^^^^^^^^^^^^^^^^^^^ auto-tracking!
```

### Step 2: Replace get/set with .value

**Before (v2):**
```typescript
import { zen, get, set } from '@sylphx/zen';

const count = zen(0);
const value = get(count);
set(count, value + 1);
```

**After (v3):**
```typescript
import { zen } from '@sylphx/zen';

const count = zen(0);
const value = count.value;
count.value = value + 1;
```

### Step 3: Update subscribe() usage

**Before (v2):**
```typescript
import { subscribe } from '@sylphx/zen';

subscribe(count, (newValue, oldValue) => {
  console.log(newValue);
});
```

**After (v3):**
```typescript
import { subscribe } from '@sylphx/zen';

subscribe(count, (newValue, oldValue) => {
  console.log(newValue);
});
// ✅ Same API! No changes needed
```

### Step 4: Migrate complex computed

**Before (v2):**
```typescript
const firstName = zen('John');
const lastName = zen('Doe');
const fullName = computed([firstName, lastName], (first, last) => {
  return `${first} ${last}`;
});
```

**After (v3):**
```typescript
const firstName = zen('John');
const lastName = zen('Doe');
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});
// Much cleaner! Auto-tracks both dependencies
```

---

## 🔄 Conditional Dependencies

This is where v3 really shines!

**V2 Problem:**
```typescript
const useA = zen(true);
const a = zen(1);
const b = zen(2);

// Must list ALL possible dependencies
const result = computed([useA, a, b], (flag, aVal, bVal) => {
  return flag ? aVal : bVal;
});

// 🐛 Problem: Subscribes to BOTH a and b
// Even when only one is used!
```

**V3 Solution:**
```typescript
const useA = zen(true);
const a = zen(1);
const b = zen(2);

// Auto-tracking only subscribes to accessed signals
const result = computed(() => {
  return useA.value ? a.value : b.value;
});

// ✅ Smart: Only subscribes to the active branch!
// 2.12x faster for conditional logic
```

---

## ⚡ Performance Optimization (Optional)

If you need maximum performance with known dependencies, use explicit mode:

```typescript
const a = zen(1);
const b = zen(2);

// Auto-tracking (default, cleaner)
const sum1 = computed(() => a.value + b.value);

// Explicit deps (slightly faster, more verbose)
const sum2 = computed(() => a.value + b.value, [a, b]);
//                                              ^^^^^^ optional deps
```

**When to use explicit deps:**
- Performance-critical code paths
- Known, static dependencies
- Benchmarking shows it's faster (use profiler!)

**When to use auto-tracking (default):**
- Everything else (90% of cases)
- Conditional logic
- Dynamic dependencies
- Cleaner code preferred

---

## 🚀 New Feature: computedAsync

V3 introduces async computed values!

```typescript
import { zen, computedAsync } from '@sylphx/zen';

const userId = zen(1);

// Auto-tracks dependencies BEFORE first await
const user = computedAsync(async () => {
  const id = userId.value;  // ✅ Tracked!

  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  return data;  // ❌ Not tracked (after await)
});

// Access loading state
console.log(user.value.loading);  // true/false
console.log(user.value.data);     // undefined | T
console.log(user.value.error);    // undefined | Error
```

**Features:**
- ✨ Automatic dependency tracking (before first await)
- ⏳ Built-in loading states
- ❌ Error handling
- 🔄 Request cancellation
- 📦 Data preservation during reloads

---

## 🎯 Migration Checklist

- [ ] Update package.json: `"@sylphx/zen": "^3.0.0"`
- [ ] Replace all `get(signal)` with `signal.value`
- [ ] Replace all `set(signal, value)` with `signal.value = value`
- [ ] Update `computed([deps], fn)` to `computed(() => fn)`
- [ ] Remove `atom` imports, use `zen` instead
- [ ] Test conditional dependencies work correctly
- [ ] Remove map/deepMap/task if unused
- [ ] Run tests and fix any TypeScript errors
- [ ] Enjoy 80% smaller bundle! 🎉

---

## 🆘 Need v2?

If you need v2 features (map, deepMap, task), you can still use them:

```typescript
// Install v3 but use v2 APIs
import { zen, computed } from '@sylphx/zen/v2';

// Or use v1 (original) APIs
import { zen, computed } from '@sylphx/zen/v1';
```

**Note:** v2 and v1 subpath exports provide backward compatibility but don't get the v3 benefits (smaller bundle, auto-tracking).

---

## 📚 Further Reading

- [Performance Comparison](./PERFORMANCE_COMPARISON.md)
- [Detailed Benchmarks](./BENCHMARK_RESULTS.md)
- [API Documentation](./README.md)

---

## 💡 Quick Reference

### V2 → V3 API Mapping

| V2 API | V3 API | Notes |
|--------|--------|-------|
| `atom(0)` | `zen(0)` | Renamed |
| `get(signal)` | `signal.value` | Unified API |
| `set(signal, x)` | `signal.value = x` | Unified API |
| `computed([a], f)` | `computed(() => f())` | Auto-tracking |
| `map()` | ❌ Removed | Use v2 subpath |
| `deepMap()` | ❌ Removed | Use v2 subpath |
| `task()` | ❌ Removed | Use v2 subpath |
| `onMount()` | ❌ Removed | Use v2 subpath |
| - | `computedAsync()` | ✨ New! |

---

## 🎉 Welcome to V3!

Zen v3 represents a major evolution:
- **Smaller** (80% reduction)
- **Faster** (8x in real-world apps)
- **Cleaner** (auto-tracking magic)

The migration might take 30-60 minutes for a typical app, but the benefits are worth it:
- Faster load times for your users
- Less boilerplate code to maintain
- Better developer experience

**Happy coding!** 🚀

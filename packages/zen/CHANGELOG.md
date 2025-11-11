# @sylphx/zen

## 3.0.0

### Major Changes

#### 🪄 Auto-tracking Magic

The biggest change in v3.0 is **automatic dependency tracking** - no more manual dependency arrays!

```typescript
// v2.x - Manual dependencies
const fullName = computed([firstName, lastName], (first, last) =>
  `${first} ${last}`
);

// v3.0 - Auto-tracking!
const fullName = computed(() =>
  `${firstName.value} ${lastName.value}`
);
```

**Why auto-tracking?**
- **2.12x faster** for conditional dependencies
- **Zero boilerplate** - no manual dependency management
- **Smarter updates** - only tracks active code paths
- **Better DX** - focus on logic, not plumbing

#### ⚡ Performance Improvements

- **8x faster** in real-world applications (counter app: ~800K ops/s vs ~100K ops/s)
- **2.12x faster** conditional dependencies with auto-tracking (~20M ops/s vs ~9.4M ops/s)
- **1.33x faster** simple computed values (~15M ops/s vs ~11.3M ops/s)
- **Lazy subscription** - computed values only subscribe when accessed
- **Smart tracking** - dynamically adjusts subscriptions based on code paths

#### 📦 Bundle Size

- **80% smaller** than v2: **1.14 KB** gzipped (was 5.7 KB)
- **60% smaller** than Preact Signals (1.14 KB vs 2.89 KB)
- React integration: +0.3KB
- Vue integration: +0.2KB

#### 🔧 Breaking Changes

**Computed API Change**

```typescript
// v2.x - Explicit dependencies (still works as fallback)
const sum = computed([a, b], (aVal, bVal) => aVal + bVal);

// v3.0 - Auto-tracking (recommended)
const sum = computed(() => a.value + b.value);

// v3.0 - Explicit deps still supported for hot paths
const sum = computed(() => a.value + b.value, [a, b]);
```

**Select API Introduced**

```typescript
const user = zen({ name: 'John', age: 30 });
const userName = select(user, u => u.name);
```

#### ✨ New Features

- **Auto-tracking reactivity**: Automatic dependency detection
- **Conditional dependency tracking**: Only tracks accessed code paths
- **Lazy subscription**: Computed values only subscribe when first accessed
- **Select API**: Optimized single-source selectors (~7% faster than computed)
- **Optional explicit deps**: Bypass auto-tracking for critical hot paths

#### 📚 Migration Guide

See [Migration Guide v2 to v3](https://zen.sylphx.com/guide/migration-v2-to-v3) for detailed upgrade instructions.

Most code will work with minimal changes - just remove dependency arrays from `computed()` calls to enable auto-tracking!

## 2.0.0

### Major Changes

#### Native Property Accessors

The biggest change in v2.0 is the switch from function-based to property-based access:

- 73% faster reads
- 56% faster writes
- More intuitive API
- Better code ergonomics

**Breaking Changes:**
- `get(store)` → `store.value`
- `set(store, value)` → `store.value = value`
- `compute()` → `computed()`
- `listen()` → `subscribe()`

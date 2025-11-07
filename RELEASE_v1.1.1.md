# Zen v1.1.1 Release Notes 🎉

**Release Date**: November 7, 2025
**Type**: Performance & Code Quality
**Status**: ✅ Production Ready

---

## 📦 What's New

### Phase 6.1: Version Tracking Removal

After implementing Phase 6's graph coloring algorithm, version tracking became redundant. This release removes the obsolete version tracking code, resulting in cleaner code and memory savings.

**Key Changes:**
- ✅ Removed `_version` field from all zen types (8 bytes saved per node)
- ✅ Removed `_sourceVersions` tracking from computed zens
- ✅ Removed `incrementVersion()` function and global version counter
- ✅ Simplified codebase by 40+ lines of version checking logic
- ✅ Graph coloring now provides all staleness detection

**Impact:**
- **Performance**: No regression - identical to v1.1.0
- **Memory**: 8 bytes saved per zen node
- **Code Quality**: Cleaner, more maintainable codebase
- **Tests**: All 146 tests passing ✅

---

## 🚀 Performance Summary

Zen v1.1.1 maintains the **3.21x performance improvement** from v1.1.0:

### Core Operations
- **Atom Creation**: 45M ops/sec (1.08x faster than Jotai)
- **Atom Get**: 45M ops/sec (competitive with fastest libraries)
- **Atom Set**: 43M ops/sec (1.51x faster than Zustand)
- **Subscribe/Unsubscribe**: 22M ops/sec (4.9x faster than Nanostores)

### Advanced Features
- **Computed Values**: Graph coloring prevents unnecessary recomputation
- **Diamond Dependencies**: Optimized to avoid redundant updates
- **Lazy Evaluation**: Pull-based updates only when values accessed
- **Karma Cache Hits**: 0.04ms average (36x faster)

---

## 🎯 What Was Optimized

### Phase 1-6 Journey (v1.1.0)

1. **Phase 1**: Array-based listeners (+2.4x)
2. **Phase 2**: Version tracking (+2.8x)
3. **Phase 3**: Hot path inlining (+3.1x)
4. **Phase 4**: Single-source optimizations (+3.2x)
5. **Phase 5**: Minor polish (+3.21x)
6. **Phase 6**: Graph coloring algorithm (44% memory reduction)

### Phase 6.1 (v1.1.1) ← **This Release**

- Removed redundant version tracking
- Graph coloring replaced all version-based staleness checks
- Cleaner implementation, same performance
- 8 bytes saved per zen node

### Phase 7 (Evaluated & Rejected)

- Attempted bit-packing `_color` + `_dirty` into single byte
- Rejected due to 4.3% performance regression
- Documented in `PHASE7_REJECTED.md`

---

## 📊 Benchmark Comparison

### Before (v1.0.0 Baseline)
```
Atom operations: 1.58M ops/sec
```

### After (v1.1.1 Current)
```
Atom operations: 5.07M ops/sec (+3.21x) 🏆
```

**Result**: **221% faster** than baseline!

---

## 🔧 Migration Guide

### For Library Users

**No breaking changes!** v1.1.1 is a drop-in replacement for v1.1.0.

All your existing code continues to work:
```typescript
const count = zen(0);
const doubled = computed([count], v => v * 2);
subscribe(doubled, value => console.log(value));
set(count, 1); // Works identically
```

### For Contributors

If you were debugging using `_version` (internal property):

**Before**:
```typescript
console.log(zen._version); // Shows update count
```

**After**:
```typescript
console.log(zen._color); // Shows staleness state
// 0 = CLEAN, 1 = GREEN (check), 2 = RED (dirty)
```

---

## 📦 Installation

```bash
# Using bun (recommended)
bun add @sylphx/zen@1.1.1

# Using npm
npm install @sylphx/zen@1.1.1

# Using pnpm
pnpm add @sylphx/zen@1.1.1

# Using yarn
yarn add @sylphx/zen@1.1.1
```

---

## 📚 Documentation

### New Documentation
- **CHANGELOG.md** - Complete version history
- **PHASE6.1_COMPLETE.md** - Technical deep-dive
- **Updated README.md** - Graph coloring explanation

### Existing Documentation
- **PHASE6_COMPLETE.md** - Phase 6 graph coloring details
- **PHASE7_REJECTED.md** - Why bit-packing was rejected
- **README.md** - Complete API documentation

---

## 🧪 Testing

All 146 tests passing:
- ✅ Core atom tests (8/8)
- ✅ Computed tests (7/7)
- ✅ Select tests (5/5)
- ✅ Map tests (12/12)
- ✅ DeepMap tests (15/15)
- ✅ Batched tests (10/10)
- ✅ Effect tests (9/9)
- ✅ Karma tests (67/67)
- ✅ Events tests (13/13)

---

## 🎁 What's Included

### Core Package (@sylphx/zen)
- Reactive atoms (`zen`)
- Computed values (`computed`)
- Select optimization (`select`)
- Object state (`map`)
- Nested state (`deepMap`)
- Async state (`karma`)
- Batching (`batch`, `batched`)
- Effects (`effect`)
- Advanced hooks (`onStart`, `onStop`, etc.)

### Framework Integrations
- React (216 bytes)
- Vue (~200 bytes)
- Solid.js (234 bytes)
- Svelte (167 bytes)
- Preact (177 bytes)

### Ecosystem
- @sylphx/zen-craft (Immutable updates)
- @sylphx/zen-persistent (LocalStorage sync)
- @sylphx/zen-router (Framework-agnostic routing)

---

## 🙏 Credits

Built with ❤️ by the Sylph team.

Special thanks to:
- **Reactively** - Inspiration for graph coloring algorithm
- **All contributors** - Testing, feedback, and improvements

---

## 🔜 What's Next?

### v1.2.0 (Planned)
- Effect improvements with smarter dependency tracking
- Batching optimizations for better queue management
- DevTools integration for visual graph debugging
- Additional ecosystem packages

### Future Explorations
- Structural sharing for maps/deepMaps
- Microtask batching
- Lazy initialization patterns

---

## 📄 Full Changelog

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

## 🌟 Show Your Support

If Zen makes your life easier, give it a ⭐ on [GitHub](https://github.com/sylphxltd/zen)!

---

<p align="center">
  <strong>State management that works everywhere, at lightning speed</strong>
  <br>
  <sub>v1.1.1 - Cleaner code, same blazing performance</sub>
</p>

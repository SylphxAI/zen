---
"@sylphx/zen": minor
"@sylphx/zen-craft": minor
"@sylphx/zen-patterns": minor
"@sylphx/zen-router": minor
---

test: Add comprehensive test coverage and benchmarks

**Test Coverage:**
- ✅ zen: 37 comprehensive tests covering all primitives
- ✅ zen-craft: 91 tests (produce, patch, utilities)
- ✅ zen-patterns: 36 tests (map, deepMap, async patterns)
- ✅ zen-router: 91 tests (routing, history, matchers)
- **Total: 255 tests with 100% pass rate**

**Benchmarks Added:**
- ✅ zen.bench.ts - Core primitives, computed, subscribe, effect, batch, real-world patterns
- ✅ map.bench.ts, deepMap.bench.ts, async.bench.ts - Pattern performance metrics
- ✅ routing.bench.ts - Router performance benchmarks
- ✅ index.bench.ts - Craft operations benchmarking

**Fixes:**
- Fixed workspace dependency resolution for test runners
- Added missing test scripts to zen-router
- Documented lazy computed evaluation behavior

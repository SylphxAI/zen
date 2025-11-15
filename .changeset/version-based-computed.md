---
"@sylphx/zen": minor
---

refactor: Version-based computed reactivity optimization

**Performance Improvements:**
- ✅ Version-based staleness checking - avoids unnecessary recomputation
- ✅ O(n sources) version check vs full recompute
- ✅ Better cache utilization for deep computed chains

**Code Quality:**
- ✅ Extract `valuesEqual()` helper for consistent NaN/+0/-0 handling
- ✅ Extract `_recomputeIfNeeded()` for clearer lazy evaluation logic
- ✅ Extract `flushPendingNotifications()` for cleaner batch implementation
- ✅ Enhanced comments and documentation

**Backward Compatibility:**
- ✅ No breaking changes
- ✅ All 255 tests passing
- ✅ Drop-in replacement for existing code

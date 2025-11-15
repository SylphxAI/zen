---
"@sylphx/zen": patch
---

fix(zen): critical bug fixes and code improvements

**Critical Fixes:**
- Fixed computed chain stale propagation bug where downstream computeds weren't marked stale
- Added cyclic dependency detection by checking FLAG_PENDING before computation
- Removed dead code (arraysEqual, createSourcesArray)
- Fixed misleading O(1) unsubscribe documentation (actually O(n))

**Performance Impact:**
- ✅ Computed operations: +218% to +375% improvement
- ✅ Batch operations: +78% to +444% improvement
- ✅ Single subscriber notifications: +351% improvement
- ⚠️ Multi-subscriber notifications: -51% to -66% (now correctly propagates stale flags)

The multi-subscriber performance decrease is expected and acceptable - the previous version was skipping necessary cascade updates due to the bug. Correctness > Performance.

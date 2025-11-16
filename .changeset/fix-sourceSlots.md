---
"@sylphx/zen": patch
---

Fix critical bug in incremental dependency tracking where _sourceSlots was cleared before unsubscribe

**Critical correctness fix**: `_sourceSlots` was being cleared before calling unsubscribe closures, breaking slot-based O(1) unsubscribe and causing memory leaks.

**The bug:**
- Incremental dependency tracking cleared `_sourceSlots.length = 0` before calling `prevUnsubs[i]!()`
- Unsubscribe closure reads `observer._sourceSlots[observerSourceIndex]` to locate itself in source's listener array
- With slots cleared → index becomes `undefined` → closure thinks edge is already removed → returns early
- Result: Edges never cleaned up, listeners accumulate in source arrays (memory leak)

**The fix:**
1. Do NOT clear `_sourceSlots` before unsubscribe operations
2. Let unsubscribe closures use old slots to correctly locate and remove edges
3. Only resize `_sourceSlots` after all unsub/sub operations complete

**Additional improvements:**
- Clarified GLOBAL_EFFECT_COUNT documentation (counts effect edges + legacy listeners)
- Added comments explaining slot ordering requirements
- Ensures incremental dependency tracking works correctly with slot-based unsubscribe

This maintains correctness of the incremental dependency optimization introduced in v3.21.0.

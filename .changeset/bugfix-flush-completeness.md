---
'@sylphx/zen': patch
---

fix(zen): critical bug fixes for reactive propagation and effect tracking

**Bug Fixes:**

1. **Flush Completeness (#1.1)**: Fixed updates during effect execution getting lost
   - Added outer loop in `flushBatchedUpdates()` to handle effects that modify signals during notification phase
   - Ensures complete propagation when effects trigger new signal changes
   - Test case added for verification

2. **Global Effect Tracking (#1.2)**: Fixed GLOBAL_HAS_EFFECTS never clearing
   - Changed from boolean `GLOBAL_HAS_EFFECTS` to integer `GLOBAL_EFFECT_COUNT`
   - Properly decrements on effect unsubscribe for accurate tracking
   - Re-enables optimization when all effects are removed

3. **Subscribe Cleanup (#2.4)**: Improved notification cleanup robustness
   - Clear all pending notifications for node, not just first entry
   - Handles edge cases where listener triggers multiple batches
   - More conservative FLAG_PENDING_NOTIFY clearing

**Impact**: These fixes ensure correct reactive propagation in complex scenarios involving effects that modify signals during batch execution.

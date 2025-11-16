---
"@sylphx/zen": patch
---

Critical bug fixes for scheduler and subscribe API

**Fixed Bugs:**

1. **subscribe() undefined handling** - Fixed bug where signals with undefined initial values would skip first 2 updates. Now uses hasValue flag instead of undefined check.

2. **Dead work elimination** - Added guard to queueBatchedNotification to skip queue when no legacy effect listeners exist. Eliminates unnecessary allocations in effect-based subscribe apps.

3. **Error recovery** - Clear all queue flags in finally block to prevent stuck state when effects/computeds throw errors. Ensures scheduler can recover from errors correctly.

**Impact:**
- Fewer allocations (no pending notifications without legacy listeners)
- Safer error handling (flags always cleared on errors)
- Correct undefined handling (no silent bugs with undefined values)

All 48 tests passing.

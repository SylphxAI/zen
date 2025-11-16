---
"@sylphx/zen": patch
---

Fix critical scheduler bug: remove GLOBAL_EFFECT_COUNT from legacy listeners

**Critical correctness fix**: Prevents incorrect lazy-path bypass when using legacy effect listeners (currently unused but will affect future APIs like `onChange`).

**The bug:**
- `addEffectListener` (legacy listener API) was incrementing `GLOBAL_EFFECT_COUNT`
- `propagateToComputeds` uses `GLOBAL_EFFECT_COUNT === 0` to decide between lazy-only vs full scheduler
- When legacy listeners exist but no effect edges:
  1. `GLOBAL_EFFECT_COUNT > 0` (from legacy listener)
  2. `propagateToComputeds` skips lazy-only branch
  3. `markComputedDirty` checks `hasDownstreamEffectListeners`
  4. Upstream computeds without `FLAG_HAD_EFFECT_DOWNSTREAM` don't get queued
  5. Result: Stale computeds not marked → consumers get old cached values

**The fix:**
- Remove `GLOBAL_EFFECT_COUNT` increment/decrement from `addEffectListener`
- `GLOBAL_EFFECT_COUNT` now exclusively tracks effect→source edges (managed by `trackEffectEdge`)
- Legacy listeners rely on `FLAG_HAD_EFFECT_DOWNSTREAM` + notification queue only
- Ensures `GLOBAL_EFFECT_COUNT === 0` truly means "no push-style effects exist"

**Mental model:**
- `GLOBAL_EFFECT_COUNT = 0` → pure pull-style, lazy invalidation only
- `GLOBAL_EFFECT_COUNT > 0` → active effects exist, run full scheduler
- Legacy listeners = separate notification mechanism, don't affect scheduling decisions

This maintains correctness for future APIs using `addEffectListener`.

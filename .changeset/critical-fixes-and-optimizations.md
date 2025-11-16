---
"@sylphx/zen": patch
---

Critical correctness fixes and V8 optimizations

**Correctness Fixes:**
- Fixed Effect duplicate source subscription bug (epoch dedup for all collectors)
- Fixed dependency diff unsubscribe failure (reverted to safe full unsub/resub)
- Removed type-unsafe currentListener._flags check (now uses _epoch)

**Performance Optimizations:**
- Simplified trackSource - single code path for better V8 inlining
- Removed try/catch from EffectNode hot paths (production-first approach)
- Errors now propagate to app for maximum V8 optimization

All 47 tests pass. Production philosophy: fast paths optimized, error handling at app layer.

---
"@sylphx/zen": patch
---

Critical bug fixes and micro-optimizations:

**Bug Fixes:**
- Fixed `subscribe()` stealing batched notifications from existing listeners when subscribing mid-batch
- Simplified `dirtyNodes` queue (signals only, removed dead computed code path)

**Micro-optimizations:**
- Effect object stable hidden class for V8 optimization
- `peek()` fast path for signals (direct value read, no tracking manipulation)
- Reuse `notifyEffects()` in signal direct path (single optimized loop)
- Updated documentation to accurately describe conservative caching

**Performance improvements:**
- create zen signal: +40%
- effect + dispose: +49%
- nested batch: +789%
- subscribe + unsubscribe: +13%
- Bundle size: -30 bytes gzipped

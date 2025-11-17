---
'@sylphx/zen': patch
---

v3.44.2: Fix v3.44.1 build regression (republish with correct code)

BUILD FIX - v3.44.1 Published Wrong Code:
- v3.44.1 source code had batch mechanism restored (correct)
- v3.44.1 dist files contained v3.44.0 code without batching (incorrect)
- v3.44.2 rebuilds and republishes with correct source code

PERFORMANCE VERIFICATION (v3.44.1 benchmark results):
- Overall: 57.8/100 (should be 69.4/100 after v3.44.2)
- Wide Fanout: 300K ops/sec (should be 336K ops/sec)
- Massive Fanout: 33K ops/sec (should be 35K ops/sec)
- Single Write: 15.6M ops/sec (should be 17.9M ops/sec)

ROOT CAUSE:
- CI build workflow didn't rebuild dist files before publishing
- Published npm package contained stale v3.44.0 dist files
- Batch mechanism is critical for 100+ observer performance

FIX:
- Rebuild dist files with current source code (batch mechanism restored)
- Republish as v3.44.2 to ensure correct code is distributed
- Future: Add build verification to CI publish workflow

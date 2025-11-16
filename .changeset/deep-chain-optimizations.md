---
'@sylphx/zen': minor
---

Deep chain and read optimizations for extreme performance

OPTIMIZATIONS:
- Set CLEAN state after CHECK verification (avoid redundant checks)
- Early exit in _updateIfNecessary when source changed
- Length caching in loops (avoid repeated .length access)
- Optimized read() with observer check first
- Guard _updateIfNecessary calls with state check

BENCHMARK TARGETS:
- Very Deep Chain (100 layers): Target >300K ops/sec (was 249K)
- Extreme Read (10000x): Target >80K ops/sec (was 64K)
- Deep Chain (10 layers): Maintain 2.2M ops/sec
- Reduced overhead in STATE_CHECK propagation

These optimizations reduce redundant state checks and improve cache locality for deep dependency chains.

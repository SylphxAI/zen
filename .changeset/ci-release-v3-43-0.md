---
'@sylphx/zen': patch
---

v3.43.0: Revert v3.42.0 chunked batching regression

REVERT - v3.42.0 Chunked Batching:
- Removed chunked processing for 500+ observer scenarios
- Chunked batching added nested loop overhead that exceeded any cache locality benefit
- Caused major performance regressions across multiple benchmarks

PERFORMANCE IMPACT (v3.42.0 regression):
- Massive Fanout (1→1000): 36K → 29K ops/sec (-19% regression)
- Wide Fanout (1→100): 356K → 258K ops/sec (-27% regression)
- Single Write: 19.7M → 15.4M (-22% regression)
- Overall: 63.1/100 → 60.7/100 (-2.4 points)

ROOT CAUSE:
- Nested loop overhead (chunk iteration + inner loop) exceeded theoretical cache benefits
- For 1000 observers: v3.41.1 used single loop (1000 iterations), v3.42.0 used nested loops (10 chunks × 100 observers + overhead)

RESTORATION:
- Restore v3.41.1 baseline performance (63.1/100 variance-based score)
- Return to simple batching strategy for 100+ observers

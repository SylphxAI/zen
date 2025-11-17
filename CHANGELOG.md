# Changelog

## 3.41.0 - 2025-11-17

### Fixed
- Reverted v3.40.0 loop unrolling optimization that caused 22% regression in Computed Value Access
- Reverted batch threshold lowering (100→10) that hurt medium fanouts
- Reverted dual state extraction that added overhead to hot path

### Added
- Optimized Computation.read() for untracked reads (no currentObserver)
- Fast path that avoids tracking logic when reading outside reactive context
- Targets Extreme Read benchmark (10000x untracked reads): 64K→150K+ ops/sec

### Performance
- Expected to recover Single Read to 21.5M ops/sec (from v3.38.0 baseline)
- Expected to recover Computed Value Access to 17.2M ops/sec
- Expected Hybrid Weighted score: 50.0→57.6/100 (reverting regression)

## 3.40.0 - 2025-11-17 (REGRESSION - REVERTED)

Loop unrolling and batch threshold optimizations caused significant regressions.

## 3.38.0 - 2025-11-16

Micro-optimizations for read performance.

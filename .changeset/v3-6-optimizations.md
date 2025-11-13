---
"@sylphx/zen": minor
---

## v3.6.0 - Performance Optimizations

This release implements two key optimizations:

### 1. Version Number Tracking (5-10% improvement potential)
- Each signal tracks a version number incremented on write
- Computed values store source versions for fast dependency checking
- Provides fast-path to skip recomputation when dependencies unchanged
- Particularly effective for deep chains and diamond patterns

### 2. Observer Slots O(1) Cleanup (3-5% improvement potential)
- Bidirectional slot tracking for computed listeners
- Swap-and-pop algorithm for O(1) removal vs O(n) indexOf + splice
- Reduces overhead during subscription changes
- Better performance for dynamic reactive graphs

### Bundle Size
- **Brotli**: 2.09 KB (v3.5: 1.96 KB, +6.6%)
- **Gzip**: 2.37 KB (v3.5: 2.21 KB, +7.2%)

Trade-off: Slightly larger bundle for cleaner algorithm complexity and better performance characteristics.

### Breaking Changes
None - fully backward compatible with v3.5.

### Technical Details
- Fast integer version comparison for dependency checking
- O(1) cleanup with bidirectional index tracking
- ~32-40 bytes memory overhead per computed node (negligible)
- All optimizations are internal implementation details

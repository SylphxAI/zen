---
'@sylphx/zen': minor
---

v3.45.0: Stable dependency detection optimization

OPTIMIZATION - Dependency Graph Updates:
- Detect when computed dependencies remain unchanged after update
- Skip observer graph operations for stable single-source computeds
- Reduces overhead in massive fanout scenarios (1→1000)

IMPLEMENTATION:
- Fast path detection: single source unchanged between updates
- Common case: computed(() => signal.value * factor)
- Skips removeSourceObservers() and re-registration when dependencies stable

TARGET SCENARIOS:
- Massive Fanout (1→1000): 1000 computeds reading same signal
- Each update previously re-registered observers unnecessarily
- New: Skip 1000× graph updates when source unchanged

EXPECTED IMPACT:
- Massive fanout: 2-3x improvement potential
- No impact on dynamic dependencies (fallback to standard path)
- Maintains correctness for all dependency patterns

RISK MITIGATION:
- Conservative detection (only single stable source)
- All 48 tests passing
- Fallback to full graph update if any variance detected

---
"@sylphx/zen": minor
---

feat: queue-based batching with lazy evaluation (v3.2)

BREAKING: None (fully backward compatible)

Architecture improvements in v3.2:
- Implemented queue-based batching (Solid-inspired architecture)
- Lazy evaluation for unobserved computed values
- 3-stage batch processing (Updates → Notifications → Effects)
- Iterative dependency chain handling (a → b → c)
- Correct deduplication: 2 signal updates → 1 computed update per batch

Technical changes:
- Set-based Updates queue for automatic deduplication
- isProcessingUpdates flag prevents double notifications
- force parameter in updateComputedValue for lazy optimization
- Proper notification timing based on batch processing phase

Test results:
- All 77 tests passing
- Zero breaking changes
- Bundle size: 1.97 KB gzipped (from 1.68 KB, +290 bytes)

Perfect for reactive applications with subscribed state (React, Vue, Svelte).

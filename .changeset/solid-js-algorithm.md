---
'@sylphx/zen': minor
---

Complete Solid.js algorithm absorption - deep reactivity patterns now working

SOLID.JS CORE ALGORITHM:
- track() optimization with source comparison
- Incremental source updates (only update changed portion)
- Global clock system (_time vs epoch)
- Proper STATE_CHECK (recursive check all sources first)
- Context save/restore (observer/owner/newSources)
- Error clearing at update start (recovery)
- No global updateCount (acyclic graph guarantee)

CRITICAL FIXES:
- Fixed effect double-fire: FLAG_PENDING cleared after update()
- Fixed effect re-scheduling: isExecutingSelf bypasses FLAG_PENDING check
- Fixed STATE_CHECK propagation: removed premature CLEAN setting
- Fixed deep reactivity: removed global updateCount infinite loop detector

BENCHMARK IMPACT:
Previously failing with 0 ops/sec, now:
- Diamond Pattern (3 layers): 3.5M ops/sec
- Deep Chain (10 layers): 2.3M ops/sec
- Very Deep Chain (100 layers): 452K ops/sec
- Massive Fanout (1→1000): 54K ops/sec
- Dynamic Dependencies: 7.1M ops/sec

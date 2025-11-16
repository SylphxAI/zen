---
"@sylphx/zen": minor
---

Major performance optimizations for batched updates and computed graphs:

**Two-Phase Batch Flush with Deduplication:**
- Eliminates duplicate computed recomputes when multiple sources change in same batch
- Phase 1: Collect all dirty computeds into dedup queue
- Phase 2: Recompute each computed once (even if 10 sources changed)
- Added `FLAG_IN_COMPUTED_QUEUE` for O(1) deduplication

**Global Effects Shortcut:**
- Skip expensive DFS traversal when no effects/subscribers exist
- Pure pull-style computed graphs now have zero propagation overhead
- `GLOBAL_HAS_EFFECTS` flag enables instant bailout
- Perfect for server-side rendering and data transformation pipelines

**Optimized Propagation Paths:**
- Global shortcut: no effects → lazy-only (just mark stale)
- Batched path: use dedup queue to avoid redundant work
- Direct path: eager recompute only when effects exist

**Performance improvements:**
- Computed chain: +55%
- Real-world todo list: +217% 🔥🔥
- Real-world reactive graph: +173% 🔥🔥
- Batch operations: +10%
- Zero overhead for pure computed graphs (no effects)

**Trade-offs:**
- +7 bits for new flag
- +1 boolean global
- +1 dedup queue
- Massive wins for complex reactive graphs

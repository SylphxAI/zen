# Architecture

## System Overview

Zen implements a **prototype-based reactive graph** with automatic dependency tracking and micro-batching. The system achieves O(1) signal creation, O(n) dependency tracking, and zero-allocation hot paths.

Core primitive: `signal<T>()` creates reactive state. Derived values via `computed()`. Side effects via `effect()`. All dependencies tracked automatically—no manual arrays needed.

**Key innovation:** Automatic micro-batching batches downstream notifications during write operations, eliminating redundant recomputations without explicit `batch()` calls.

## Key Components

<!-- VERIFY: packages/zen-signal/src/zen.ts -->
- **Signal** (`packages/zen-signal/src/zen.ts`): Core reactive primitive with prototype-based creation
- **Computed** (`packages/zen-signal/src/zen.ts`): Lazy computed values with auto-tracked dependencies
- **Effect** (`packages/zen-signal/src/zen.ts`): Side effects with auto-tracking and cleanup support
- **Batching System** (`packages/zen-signal/src/zen.ts`): Micro-batch + explicit batch with deduplication
- **Auto-tracking** (`packages/zen-signal/src/zen.ts`): Global `currentListener` tracks dependencies during execution

<!-- VERIFY: packages/zen/src/ -->
- **Zen Framework** (`packages/zen/`): Fine-grained reactive framework with custom JSX runtime

<!-- VERIFY: packages/unplugin-zen-signal/ -->
- **Universal Plugin** (`packages/unplugin-zen-signal/`): Runtime-first architecture with optional compiler optimizations

## Design Patterns

### Pattern: Prototype-Based Signal Creation
**Why:** Minimize allocation overhead vs class constructors
**Where:** `signal()` in `packages/zen-signal/src/zen.ts`
**Trade-off:** Slightly less intuitive vs classes, but 30%+ faster creation. Worth it: signals created frequently.

### Pattern: Automatic Micro-Batching (v3.48.0+)
**Why:** Batch downstream notifications during writes without explicit `batch()` calls
**Where:** `zenProto.value` setter in `packages/zen-signal/src/zen.ts`
**Trade-off:** Extra logic in write path vs smoother effects and better perf. Worth it: 37% faster concurrent updates, eliminates glitches.

### Pattern: O(n) Inline Deduplication
**Why:** Avoid O(n²) `includes()` or Set overhead for dependency tracking
**Where:** `zenProto.value` getter, `computedProto.value` getter in `packages/zen-signal/src/zen.ts`
**Trade-off:** Manual loop vs Set abstraction. Worth it: Dependency arrays typically small (1-5 items), inline loop faster.

### Pattern: Dirty Flag Propagation
**Why:** Lazily invalidate computed values without eager recomputation
**Where:** `zenProto.value` setter in `packages/zen-signal/src/zen.ts`
**Trade-off:** Pull-based recomputation vs push-based. Worth it: Many computeds never re-read after invalidation.

### Pattern: Auto-Tracking with Global Listener
**Why:** Eliminate manual dependency arrays
**Where:** `currentListener` global in `packages/zen-signal/src/zen.ts`
**Trade-off:** Global state vs explicit deps. Worth it: Cleaner API, handles conditional/dynamic deps automatically.

### Pattern: Runtime-First Architecture (ADR-001)
**Why:** Framework integrations work without compiler, compiler optional for optimization
**Where:** `packages/unplugin-zen-signal/`
**Trade-off:** Runtime overhead (~5-10%) vs zero-config experience. Worth it: Developer experience, easier debugging, compiler can optimize later.

## Boundaries

**In scope:**
- Signal primitives (signal, computed, effect, subscribe)
- Batch updates (batch, untrack, peek)
- Auto-tracking system
- Memory optimization for hot paths
- TypeScript type safety
- Framework integrations (runtime + compiler modes)

**Out of scope:**
- Framework-specific state patterns (Redux, Zustand-style stores) - see `@zen/signal-patterns`
- Persistence - see `@zen/signal-persistent`
- Immutability helpers - see `@zen/signal-craft`
- Routing - see `@zen/router`
- DevTools - future package

## Package Structure

```
packages/
  zen-signal/              @zen/signal - Core reactive primitives
  zen/                     @zen/zen - Fine-grained framework

  # Framework integrations
  zen-signal-zen/          @zen/signal-zen - Zen framework adapter

  # Utilities
  zen-signal-patterns/     @zen/signal-patterns - Store, async, map patterns
  zen-signal-persistent/   @zen/signal-persistent - localStorage/sessionStorage
  zen-signal-craft/        @zen/signal-craft - Immutable updates

  # Routing
  zen-router/              @zen/router - Core router
  zen-router-react/        @zen/router-react - React bindings
  zen-router-preact/       @zen/router-preact - Preact bindings
  zen-router-zen/          @zen/router-zen - Zen framework bindings

  # Universal plugin
  unplugin-zen-signal/     unplugin-zen-signal - Runtime-first, all frameworks
```

## Performance Characteristics

**From v3.49.0 benchmarks:**
- Very Deep Chain (100 layers): 5.6M ops/sec (42x faster than v3.48.0)
- Deep Chain (10 layers): 7.7M ops/sec (5.8x faster)
- Deep Diamond (5 layers): 1.8M ops/sec (4.7x faster)
- Moderate Read (100x): 1.9M ops/sec (2.4x faster)

**Bundle sizes:**
- @zen/signal: 1.68 KB gzipped (3.7 KB minified)
- Target: ≤1.75 KB gzipped

## Architecture Evolution

**v3.1.1:** Simple prototype-based, dirty flags, no timestamps
**v3.48.0:** Added automatic micro-batching for smooth effects
**v3.49.0:** Combined v3.1.1 simplicity + v3.48.0 batching, removed all timestamp overhead
**Current:** Prototype-based with micro-batching, O(n) deduplication, zero allocations in hot paths

# Zen Performance Baseline (Before Optimization)

**Date:** 2025-11-06
**Commit:** Before listener/map/path optimizations

## Core Atom Operations

| Operation | Zen (ops/s) | Competitor | Ratio |
|-----------|-------------|------------|-------|
| **Atom Creation** | 45,190,039 | Nanostores: 4,301,343 | **10.51x faster** |
| **Atom Get** | 44,052,269 | Nanostores: 24,324,808 | **1.81x faster** |
| **Atom Set (No Listeners)** | 43,280,575 | Nanostores: 28,252,017 | **1.53x faster** |
| **Subscribe/Unsubscribe** | 14,390,959 | Zustand: 14,878,787 | 1.03x slower ⚠️ |

## Map Operations

| Operation | Zen (ops/s) | Nanostores (ops/s) | Ratio |
|-----------|-------------|-------------------|-------|
| **Map Creation** | 39,487,777 | 5,573,643 | **7.08x faster** ✅ |
| **Map Get** | 44,463,670 | 24,122,268 | **1.84x faster** ✅ |
| **Map Set Key** | 19,901,959 | 24,601,039 | **1.24x SLOWER** ❌ |

## DeepMap Operations

| Operation | Zen (ops/s) | Nanostores (ops/s) | Ratio |
|-----------|-------------|-------------------|-------|
| **Creation** | 44,267,048 | 6,321,065 | **7.00x faster** ✅ |
| **setPath (shallow)** | 8,778,988 | 2,022,797 | **4.34x faster** ✅ |
| **setPath (1 level)** | 3,418,840 | 1,305,758 | **2.62x faster** ✅ |
| **setPath (2 levels)** | 3,267,939 | 1,353,118 | **2.42x faster** ✅ |
| **setPath (array index)** | 6,668,259 | 1,419,583 | **4.70x faster** ✅ |

## Computed Operations

| Operation | Zen (ops/s) | Competitor | Ratio |
|-----------|-------------|------------|-------|
| **Creation (1 dep)** | 36,550,257 | Jotai: 40,682,750 | 1.11x slower ⚠️ |
| **Get (1 dep)** | 45,427,702 | Jotai: 50,655,174 | 1.12x slower |
| **Update Propagation** | 18,499,126 | Zustand: 23,213,617 | **1.25x SLOWER** ❌ |

## Karma (Task) Operations

| Operation | Zen (ops/s) |
|-----------|-------------|
| **Karma Creation** | 42,767,197 |
| **runKarma (resolve)** | 881.77 |
| **runKarma (reject)** | 858.31 |

## Batch Operations

| Operation | Zen (ops/s) | Nanostores (ops/s) | Ratio |
|-----------|-------------|-------------------|-------|
| **2 Sets (no listeners)** | 6,501,871 | 2,949,833 | **2.20x faster** ✅ |
| **5 Sets (no listeners)** | 2,455,862 | 1,359,591 | **1.81x faster** ✅ |
| **10 Sets (no listeners)** | 971,743 | 570,549 | **1.70x faster** ✅ |

## Top Optimization Targets

Based on benchmark results, priority areas:

1. **Map Set Key** - Currently 1.24x SLOWER than Nanostores (19.9M vs 24.6M)
2. **Computed Update Propagation** - Currently 1.25x SLOWER than Zustand (18.5M vs 23.2M)
3. **Subscribe/Unsubscribe** - Room for improvement vs Zustand (14.4M vs 14.9M)
4. **Listener Notifications** - Used in all hot paths, spread operator overhead

## Expected Improvements

### Optimization #1: Listener Array Spread (estimated +15-30%)
- Target: All notification paths (atom set, map set, computed update)
- Expected impact: 15-30% faster notifications

### Optimization #2: Map Object Spread (estimated +20-40%)
- Target: Map Set Key operation
- Expected: 19.9M → 25-28M ops/s (beat Nanostores)

### Optimization #3: DeepMap Path Parsing (estimated +50-100%)
- Target: Simple path parsing (dot notation)
- Expected: 8.8M → 13-17M ops/s (setPath shallow)

### Optimization #4: Computed Loop (estimated +10-20%)
- Target: Computed update propagation
- Expected: 18.5M → 20-22M ops/s (closer to Zustand)

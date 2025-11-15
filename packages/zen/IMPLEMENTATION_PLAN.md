# Implementation Plan: SolidJS-Inspired Batching

## Goal
Match SolidJS performance while maintaining correctness and auto-batching.

## Current vs Target

### Current (Slow)
```typescript
set value(newValue) {
  // ...
  const wasTopLevel = batchDepth === 0;
  if (wasTopLevel) batchDepth++;  // Auto-batch

  try {
    if (batchDepth > 0) {
      pendingNotifications.set(this, oldValue);  // Map
      // Mark dirty + EAGER recalc in listener
    }
  } finally {
    if (wasTopLevel) {
      flushBatch();  // Iterate Map, notify listeners
      batchDepth--;
    }
  }
}
```

### Target (Fast like SolidJS)
```typescript
set value(newValue) {
  // ...
  if (batchDepth > 0) {
    // Already batching, just queue
    pendingUpdates.push(this);
    return;
  }

  // Start auto-batch
  batchDepth++;
  try {
    pendingUpdates.push(this);
    flushBatch();  // Process queue ONCE
  } finally {
    batchDepth--;
  }
}
```

## Key Changes

### 1. Replace Map with Array ✅

**Before:**
```typescript
const pendingNotifications = new Map<AnyZen, any>();
pendingNotifications.set(zen, oldValue);
```

**After:**
```typescript
const pendingUpdates: AnyZen[] = [];
if (!pendingUpdates.includes(zen)) {  // Or use Set for dedup
  pendingUpdates.push(zen);
}
```

**Why:** Array push is faster than Map.set()

### 2. Add State Tracking ✅

```typescript
type ZenCore<T> = {
  _value: T;
  _state: 0 | 1 | 2;  // CLEAN=0, STALE=1, PENDING=2
  // ...
}
```

**State transitions:**
- CLEAN → STALE: When dependency changes
- STALE → PENDING: During recalculation
- PENDING → CLEAN: After recalculation complete

### 3. Don't Eagerly Recalculate ✅

**Current (in subscribeToSources):**
```typescript
const onSourceChange = () => {
  c._dirty = true;
  updateComputed(c);  // ← EAGER - recalculates immediately!
};
```

**Target:**
```typescript
const onSourceChange = () => {
  if (c._state === CLEAN) {
    c._state = STALE;
    if (batchDepth > 0) {
      pendingUpdates.push(c);  // Queue for later
    } else {
      // Start auto-batch
      batchDepth++;
      pendingUpdates.push(c);
      flushBatch();
      batchDepth--;
    }
  }
};
```

### 4. Smart Flush with State Checks ✅

```typescript
function flushBatch() {
  if (pendingUpdates.length === 0) return;

  // Process queue
  for (let i = 0; i < pendingUpdates.length; i++) {
    const item = pendingUpdates[i];

    if (item._kind === 'zen') {
      // Signal: just notify listeners
      notifyListeners(item, item._value, oldValue);
    } else {
      // Computed: recalculate if STALE
      if (item._state === STALE) {
        item._state = PENDING;
        updateComputed(item);
        item._state = CLEAN;
      }
    }
  }

  pendingUpdates.length = 0;  // Clear queue
}
```

### 5. Handle Nested Batching ✅

```typescript
function batch<T>(fn: () => T): T {
  if (batchDepth > 0) {
    // Already batching, just run
    return fn();
  }

  batchDepth++;
  try {
    const result = fn();
    flushBatch();  // Flush once at the end
    return result;
  } finally {
    batchDepth--;
  }
}
```

## Implementation Steps

### Step 1: Add State Field
```typescript
// In zen.ts
const CLEAN = 0;
const STALE = 1;
const PENDING = 2;

type ComputedCore<T> = {
  // ... existing fields ...
  _state: 0 | 1 | 2;  // Add this
};

// Initialize to STALE (needs first computation)
function computed<T>(calculation: () => T): ComputedCore<T> {
  const c = Object.create(computedProto);
  c._state = STALE;  // Instead of _dirty = true
  // ...
}
```

### Step 2: Replace Map with Array
```typescript
// Replace
const pendingNotifications = new Map<AnyZen, any>();

// With
const pendingUpdates: AnyZen[] = [];
```

### Step 3: Modify subscribeToSources
```typescript
function subscribeToSources(c: ComputedCore<any>): void {
  const onSourceChange = () => {
    if (c._state === CLEAN) {
      c._state = STALE;
      queueUpdate(c);  // New helper
    }
  };
  // ... attach listener ...
}

function queueUpdate(zen: AnyZen) {
  if (batchDepth > 0) {
    if (!pendingUpdates.includes(zen)) {
      pendingUpdates.push(zen);
    }
  } else {
    // Auto-batch
    batchDepth++;
    pendingUpdates.push(zen);
    flushBatch();
    batchDepth--;
  }
}
```

### Step 4: Modify updateComputed
```typescript
function updateComputed<T>(c: ComputedCore<T>): void {
  if (c._state === CLEAN) return;  // Already updated

  c._state = PENDING;  // Mark in progress

  // ... existing logic ...
  const newValue = c._calc();

  if (Object.is(newValue, c._value)) {
    c._state = CLEAN;
    return;  // No change
  }

  c._value = newValue;
  c._state = CLEAN;

  // Queue listeners (don't notify immediately)
  queueUpdate(c);
}
```

### Step 5: Modify Signal Setter
```typescript
set value(newValue: any) {
  if (Object.is(newValue, this._value)) return;

  const oldValue = this._value;
  this._value = newValue;

  // Mark dependent computeds STALE
  const listeners = this._listeners;
  if (listeners) {
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      if (listener._computedZen) {
        const c = listener._computedZen;
        if (c._state === CLEAN) {
          c._state = STALE;
        }
      }
    }
  }

  // Queue this signal
  queueUpdate(this);
}
```

### Step 6: Implement flushBatch
```typescript
function flushBatch(): void {
  if (pendingUpdates.length === 0) return;

  // Deduplicate (optional, depends on queueUpdate impl)
  const unique = new Set(pendingUpdates);
  pendingUpdates.length = 0;

  // Process queue
  for (const item of unique) {
    if (item._kind === 'computed' && item._state === STALE) {
      updateComputed(item);
    }
    // Notify listeners
    notifyListeners(item, item._value, oldValue);
  }

  // Flush effects
  if (pendingEffects.length > 0) {
    const effects = pendingEffects.slice();
    pendingEffects.length = 0;
    for (const effect of effects) {
      effect();
    }
  }
}
```

## Testing Strategy

1. **Unit tests:** Verify state transitions (CLEAN → STALE → PENDING → CLEAN)
2. **Diamond test:** Ensure zero redundant calculations
3. **Nested batch test:** Verify inner batches don't flush
4. **Benchmark:** Compare against baseline

Expected: Close to SolidJS performance while maintaining correctness.

## Rollback Plan

If implementation fails:
- `git restore src/zen.ts`
- Keep current auto-batching (correct but slow)
- Investigate micro-optimizations instead

## Success Criteria

- ✅ All tests pass
- ✅ Zero redundant calculations in diamond pattern
- ✅ <100x slower than SolidJS (vs current 991x)
- ✅ Auto-batching still works
- ✅ Manual batch() still works

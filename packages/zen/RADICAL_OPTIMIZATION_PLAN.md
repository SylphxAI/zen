# Radical Optimization: Zero-Overhead Reactive Primitives

## The Real Problem

After all optimizations, we're still doing too much work per update:

```typescript
// Current: Every source.value = x triggers:
1. Equality check
2. Save oldValue
3. Check batchDepth
4. Mark downstream STALE (loop)
5. Check _queued flags
6. Push to pendingNotifications
7. Increment ExecCount
8. Iterate pendingNotifications
9. runTop for each (walks ancestors)
10. updateComputed
11. Notify listeners (loop)

Total: ~50-80 operations per trivial update
```

## SolidJS Equivalent

```typescript
// SolidJS (compiler-optimized):
1. Equality check
2. Mark observers STALE (direct array access)
3. Return (if Updates exists)
   OR
   Queue + flush once

Total: ~5-15 operations per update
```

## The Radical Approach

### 1. Remove Auto-Batching Entirely ⚡

**Hypothesis:** Auto-batching overhead is killing us. SolidJS has it, but their compiler makes it cheaper.

**Change:**
```typescript
// Current:
set value(newValue) {
  // ... equality ...
  if (batchDepth > 0) { /* queue */ }
  else {
    batchDepth = 1;
    /* queue + flush */
    batchDepth = 0;
  }
}

// Radical:
set value(newValue) {
  // ... equality ...
  const listeners = this._listeners;
  if (!listeners) return;

  for (let i = 0; i < listeners.length; i++) {
    listeners[i](newValue, oldValue);
  }
}
```

**Impact:**
- Removes batchDepth checks
- Removes auto-batch overhead
- Direct notification (like v3.1.1)
- User must manually batch for glitch-free updates

**Expected:** 10-50x improvement

**Trade-off:** Breaking change, worse DX

---

### 2. Inline Everything 🔥

**Hypothesis:** Function calls kill performance. Inline all hot paths.

**Change:**
```typescript
// Current: Separate functions
function runTop(node) { ... }
function updateComputed(c) { ... }
function flushBatch() { ... }

// Radical: Inline into setter
set value(newValue) {
  if (newValue === this._value) return;

  const oldValue = this._value;
  this._value = newValue;
  const listeners = this._listeners;

  // Inline listener notification
  if (listeners) {
    const len = listeners.length;
    if (len === 1) {
      listeners[0](newValue, oldValue);
    } else if (len === 2) {
      listeners[0](newValue, oldValue);
      listeners[1](newValue, oldValue);
    } else {
      for (let i = 0; i < len; i++) {
        listeners[i](newValue, oldValue);
      }
    }
  }
}
```

**Impact:**
- No function call overhead
- Better inlining by V8
- Simpler code path

**Expected:** 2-5x improvement

---

### 3. Monomorphic Object Shapes 📐

**Hypothesis:** V8 can't optimize because object shapes vary.

**Change:**
```typescript
// Current: Optional fields
type ZenCore<T> = {
  _listeners?: Listener<T>[];  // Sometimes undefined
};

// Radical: Always present
type ZenCore<T> = {
  _listeners: Listener<T>[];  // Always array (empty if none)
};

// Initialize:
signal._listeners = [];  // Not undefined
```

**Impact:**
- V8 hidden classes consistent
- Inline caches work
- Better optimization

**Expected:** 2-3x improvement

---

### 4. Array Pooling 🏊

**Hypothesis:** Allocations cause GC pressure.

**Change:**
```typescript
// Pool for reuse
const PENDING_POOL: [AnyZen, any][] = [];
let pendingCount = 0;

function queue(zen: AnyZen, oldValue: any) {
  if (pendingCount < PENDING_POOL.length) {
    const tuple = PENDING_POOL[pendingCount];
    tuple[0] = zen;
    tuple[1] = oldValue;
  } else {
    PENDING_POOL.push([zen, oldValue]);
  }
  pendingCount++;
}

function flush() {
  for (let i = 0; i < pendingCount; i++) {
    const [zen, oldVal] = PENDING_POOL[i];
    // ... process ...
    PENDING_POOL[i][0] = null!;  // Clear reference
    PENDING_POOL[i][1] = null!;
  }
  pendingCount = 0;
}
```

**Impact:**
- Zero allocations after warmup
- No GC pressure
- Faster processing

**Expected:** 1.5-2x improvement

---

### 5. Bitflags Instead of State Enum 🚩

**Hypothesis:** Number comparisons are cheaper than any checks.

**Change:**
```typescript
// Current:
const CLEAN = 0;
const STALE = 1;
const PENDING = 2;
type State = 0 | 1 | 2;

// Radical: Bitflags
const CLEAN = 0b00;
const STALE = 0b01;
const PENDING = 0b10;
const HAS_LISTENERS = 0b100;

type ZenCore<T> = {
  _flags: number;  // All flags in one field
};

// Usage:
if (zen._flags & STALE) { /* is stale */ }
zen._flags |= STALE;  // Mark stale
zen._flags &= ~STALE; // Clear stale
```

**Impact:**
- Single field access
- Bitwise ops are faster
- Better CPU cache usage

**Expected:** 1.2-1.5x improvement

---

### 6. Direct Property Access (No Getters) 🎯

**Hypothesis:** Getter overhead is significant.

**Change:**
```typescript
// Current:
class Zen<T> {
  get value() { return this._value; }
  set value(v) { /* ... */ }
}

// Radical: Direct access with method
class Zen<T> {
  value: T;  // Direct field

  set(newValue: T) {
    if (newValue === this.value) return;
    const oldValue = this.value;
    this.value = newValue;
    this.notify(newValue, oldValue);
  }
}

// Usage:
const num = zen(0);
console.log(num.value);  // Direct access (fast)
num.set(5);              // Update (explicit)
```

**Impact:**
- No getter overhead
- Direct memory access
- Clearer update intent

**Expected:** 1.5-2x improvement

---

### 7. Separate Hot/Cold Paths ❄️

**Hypothesis:** Most signals have 0-1 listeners. Optimize for that.

**Change:**
```typescript
type ZenCore<T> = {
  _value: T;
  _listener1?: Listener<T>;  // Fast path for 1 listener
  _listeners?: Listener<T>[]; // Only allocate if >1
};

function notify(zen: ZenCore<any>, newValue: any, oldValue: any) {
  const l1 = zen._listener1;
  if (l1) {
    l1(newValue, oldValue);
    const ls = zen._listeners;
    if (ls) {
      for (let i = 0; i < ls.length; i++) {
        ls[i](newValue, oldValue);
      }
    }
  }
}
```

**Impact:**
- Zero allocation for 1 listener
- Fast path for common case
- Only pay for arrays when needed

**Expected:** 2-3x improvement

---

## Combined Impact Estimate

| Optimization | Individual | Cumulative |
|-------------|-----------|------------|
| Remove auto-batch | 10-50x | 10-50x |
| Inline everything | 2-5x | 20-250x |
| Monomorphic shapes | 2-3x | 40-750x |
| Array pooling | 1.5-2x | 60-1500x |
| Bitflags | 1.2-1.5x | 72-2250x |
| Direct access | 1.5-2x | 108-4500x |
| Hot/cold paths | 2-3x | 216-13500x |

**Realistic combined: 50-200x improvement**

This could bring us from 1000x slower to 5-20x slower.

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 hours)
1. Monomorphic shapes (always initialize arrays)
2. Inline hot paths (unroll small loops)
3. Hot/cold listener paths

**Expected: 5-10x improvement**

### Phase 2: Structural (2-3 hours)
1. Remove auto-batching (breaking change)
2. Direct property access
3. Bitflags

**Expected: Additional 5-10x improvement**

### Phase 3: Advanced (2-3 hours)
1. Array pooling
2. Custom allocator for tuples
3. Profile-guided optimizations

**Expected: Additional 2-3x improvement**

---

## The Nuclear Option: Assembly/WASM 💣

If all else fails:

```rust
// Write reactive core in Rust
// Compile to WASM
// Zero JavaScript overhead
// Expected: Match or beat SolidJS

#[wasm_bindgen]
pub struct Signal<T> {
    value: T,
    listeners: Vec<Listener>,
}

impl<T> Signal<T> {
    pub fn set(&mut self, new_value: T) {
        // Direct memory manipulation
        // No JavaScript overhead
    }
}
```

**Expected: Match SolidJS (but huge undertaking)**

---

## Let's Start

I'll implement Phase 1 (quick wins) now. These are non-breaking and should give us 5-10x improvement immediately.

Ready?

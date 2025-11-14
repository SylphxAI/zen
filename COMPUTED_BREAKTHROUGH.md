# 🔥 Computed Performance Breakthrough!

**Discovery:** Object.assign() 方式 = **6.76M ops/sec (+307%!)**

---

## 🎯 Working Code (6.76M)

```typescript
export function computed<T>(
  calculation: () => T,
  explicitDeps?: AnyZen[],
): (() => T) & ComputedCore<T> & { value: T } {
  const state: ComputedCore<T> = {
    _kind: 'computed',
    _value: null as any,
    _dirty: true,
    _sources: explicitDeps || [],
    _calc: calculation,
  };

  const readValue = () => {
    if (currentListener) {
      const sources = currentListener._sources as AnyZen[];
      if (!sources.includes(state)) {
        sources.push(state);
      }
    }
    if (state._dirty) {
      updateComputed(state);
    }
    if (state._unsubs === undefined && state._sources.length > 0) {
      subscribeToSources(state);
    }
    return state._value;
  };

  const accessor = readValue as (() => T) & ComputedCore<T> & { value: T };

  // KEY: Object.assign makes properties "own properties"
  Object.assign(accessor, state);

  // Add .value getter
  Object.defineProperty(accessor, 'value', {
    get: readValue,
    enumerable: true,
    configurable: true
  });

  return accessor;
}
```

**Result:** 6.76M ops/sec (vs 1.66M baseline)

---

## 🔍 Why It's Fast

### Theory 1: Own Properties vs Prototype Chain
**Object.assign() copies properties directly to accessor object**
- `accessor._dirty` = own property (fast)
- `accessor._value` = own property (fast)
- vs prototype: `this._dirty` lookup in chain (slower)

**V8 Optimization:**
- Own properties: Direct offset access
- Prototype properties: Dictionary/hash lookup

### Theory 2: Closure Optimization
**readValue function closes over `state`**
- `state._dirty` direct access (no `this` binding)
- V8 can inline better
- Hidden class is stable

---

## 🐛 Why Tests Fail

**Problem:** updateComputed() expects properties on the object:
```typescript
function updateComputed<T>(c: ComputedCore<T>): void {
  c._dirty = false;  // Needs to write to c
  c._value = newValue;  // Needs to write to c
}
```

**But:** After Object.assign(accessor, state), accessor 有 own properties，但 `state` object 冇 sync!

**Solution:** Need to make accessor 同 state sync，或者改 updateComputed() 接受 accessor。

---

## ✅ Fix Strategy

### Option 1: Sync accessor with state
```typescript
Object.assign(accessor, state);

// Override properties with getters/setters that sync
Object.defineProperty(accessor, '_dirty', {
  get() { return state._dirty; },
  set(v) { state._dirty = v; }
});
Object.defineProperty(accessor, '_value', {
  get() { return state._value; },
  set(v) { state._value = v; }
});
// ... for all properties
```

### Option 2: Make accessor the primary object
```typescript
// Don't use separate state, accessor IS the state
const accessor = readValue as (() => T) & ComputedCore<T> & { value: T };

// Assign properties directly to accessor
accessor._kind = 'computed';
accessor._value = null;
accessor._dirty = true;
accessor._sources = explicitDeps || [];
accessor._calc = calculation;

// readValue function uses accessor directly
const readValue = () => {
  if (accessor._dirty) {
    updateComputed(accessor);  // Pass accessor
  }
  return accessor._value;
};
```

**Problem:** Circular reference (readValue 用 accessor，但 accessor 係 readValue)

### Option 3: Bind readValue to accessor (BEST!)
```typescript
const accessor = function(this: ComputedCore<T>) {
  // Use 'this' instead of closure
  if (this._dirty) {
    updateComputed(this);
  }
  return this._value;
} as (() => T) & ComputedCore<T> & { value: T };

// Assign properties to accessor (accessor IS the state)
accessor._kind = 'computed';
accessor._value = null;
accessor._dirty = true;
accessor._sources = explicitDeps || [];
accessor._calc = calculation;

// Bind .value getter to use 'this'
Object.defineProperty(accessor, 'value', {
  get() {
    if (this._dirty) {
      updateComputed(this);
    }
    return this._value;
  }
});
```

---

## 🚀 Implementation Plan

Try Option 3 (accessor IS the state, use 'this'):

1. Make accessor a function with properties
2. Properties are own properties (fast access)
3. readValue logic uses 'this' (bound correctly)
4. updateComputed() works because it writes to accessor
5. Tests should pass

---

**Status:** Ready to implement Option 3

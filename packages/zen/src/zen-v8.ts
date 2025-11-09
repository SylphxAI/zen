/**
 * Zen V8 - Bidirectional Slots + Optimizations
 *
 * Critical optimizations from SolidJS analysis:
 * 1. ⭐⭐⭐ Bidirectional Slots - O(1) cleanup (most important)
 * 2. ⭐⭐ Inline dependency tracking - zero function call overhead
 * 3. ⭐ Optimized ExecCount - only update on value change
 * 4. Keep V4's permanent dependencies philosophy
 *
 * Expected gains: +30-50% on complex graphs (diamond, deep trees)
 * Risk: Medium - more complex data structure
 *
 * Key insight from SolidJS source code analysis:
 * - observerSlots[i] = index of this observer in source.observers
 * - sourceSlots[i] = index of this source in observer.sources
 * - Allows O(1) swap-and-pop removal instead of O(n) indexOf
 */

// ============================================================================
// Types - With Bidirectional Slots
// ============================================================================

export type Signal<T> = {
  (): T;
  (value: T): void;
  set: (value: T) => void;
  subscribe: (fn: (value: T) => void) => () => void;
  _node: SNode<T>;
};

export type Computed<T> = {
  (): T | null;
  subscribe: (fn: (value: T | null) => void) => () => void;
  _node: CNode<T>;
};

// ✅ Signal node with observerSlots for O(1) cleanup
type SNode<T> = {
  value: T;
  updatedAt: number;
  observers: CNode<any>[] | null;
  observerSlots: number[] | null; // ✅ NEW: Bidirectional index
};

// ✅ Computed node with sourceSlots for O(1) cleanup
type CNode<T> = {
  value: T | null;
  updatedAt: number | null;
  fn: () => T;
  sources: (SNode<any> | CNode<any>)[] | null;
  sourceSlots: number[] | null; // ✅ NEW: Bidirectional index
  observers: CNode<any>[] | null;
  observerSlots: number[] | null; // ✅ NEW: Bidirectional index
  equals: (a: T, b: T) => boolean;
};

// ============================================================================
// Global State
// ============================================================================

let ExecCount = 0;
let Listener: CNode<any> | null = null;

// ============================================================================
// Signal Implementation
// ============================================================================

export function signal<T>(initialValue: T): Signal<T> {
  const node: SNode<T> = {
    value: initialValue,
    updatedAt: 0,
    observers: null,
    observerSlots: null,
  };

  // ✅ Inline dependency tracking (no function call overhead)
  function getter(): T {
    if (Listener) {
      // Check if already tracked
      const sources = Listener.sources;
      if (sources) {
        // Fast path: check last added (common in loops)
        if (sources[sources.length - 1] === node) {
          return node.value;
        }

        // Check if already in sources
        let found = false;
        for (let i = 0; i < sources.length; i++) {
          if (sources[i] === node) {
            found = true;
            break;
          }
        }
        if (found) {
          return node.value;
        }
      }

      // ✅ Add bidirectional link
      addSignalDependency(Listener, node);
    }

    return node.value;
  }

  // ✅ Optimized setter - only update timestamp on value change
  function setter(newValue: T): void {
    if (Object.is(node.value, newValue)) return;

    node.value = newValue;
    ExecCount++;
    node.updatedAt = ExecCount; // ✅ Only update when value changes
  }

  const fn = function (value?: T): T | void {
    if (arguments.length === 0) {
      return getter();
    }
    setter(value!);
    return undefined;
  } as Signal<T>;

  fn.set = setter;
  fn.subscribe = (callback: (value: T) => void) => {
    const effect = createEffect(() => {
      callback(getter());
    });
    effect();
    return () => {
      cleanSources(effect._node);
    };
  };
  fn._node = node;

  return fn;
}

// ============================================================================
// Computed Implementation
// ============================================================================

export function computed<T>(
  fn: () => T,
  equals: (a: T, b: T) => boolean = Object.is,
): Computed<T> {
  const node: CNode<T> = {
    value: null,
    updatedAt: null,
    fn,
    sources: null,
    sourceSlots: null,
    observers: null,
    observerSlots: null,
    equals,
  };

  // ✅ Inline dependency tracking in getter
  function getter(): T | null {
    // Check if update needed
    if (needsUpdate(node)) {
      update(node);
    }

    // ✅ Inline dependency tracking (no function call)
    if (Listener) {
      const sources = Listener.sources;
      if (sources) {
        // Fast path: check last added
        if (sources[sources.length - 1] === node) {
          return node.value;
        }

        // Check if already tracked
        let found = false;
        for (let i = 0; i < sources.length; i++) {
          if (sources[i] === node) {
            found = true;
            break;
          }
        }
        if (found) {
          return node.value;
        }
      }

      // Add bidirectional link
      addComputedDependency(Listener, node);
    }

    return node.value;
  }

  const fn2 = getter as Computed<T>;
  fn2.subscribe = (callback: (value: T | null) => void) => {
    const effect = createEffect(() => {
      callback(getter());
    });
    effect();
    return () => {
      cleanSources(effect._node);
    };
  };
  fn2._node = node;

  return fn2;
}

// ============================================================================
// Bidirectional Dependency Tracking (O(1) cleanup)
// ============================================================================

/**
 * ✅ Add signal → computed dependency with bidirectional slots
 * This enables O(1) cleanup instead of O(n) indexOf
 */
function addSignalDependency(listener: CNode<any>, signal: SNode<any>): void {
  // Get or create arrays
  const sources = listener.sources || (listener.sources = []);
  const sourceSlots = listener.sourceSlots || (listener.sourceSlots = []);
  const observers = signal.observers || (signal.observers = []);
  const observerSlots = signal.observerSlots || (signal.observerSlots = []);

  // Add to listener's sources
  const sourceIndex = sources.length;
  sources.push(signal);

  // Add to signal's observers
  const observerIndex = observers.length;
  observers.push(listener);

  // ✅ Bidirectional slots - the key optimization!
  // sourceSlots[i] = where listener is in signal.observers
  // observerSlots[i] = where signal is in listener.sources
  sourceSlots.push(observerIndex);
  observerSlots.push(sourceIndex);

  // Update references
  listener.sources = sources;
  listener.sourceSlots = sourceSlots;
  signal.observers = observers;
  signal.observerSlots = observerSlots;
}

/**
 * ✅ Add computed → computed dependency with bidirectional slots
 */
function addComputedDependency(listener: CNode<any>, computed: CNode<any>): void {
  // Get or create arrays
  const sources = listener.sources || (listener.sources = []);
  const sourceSlots = listener.sourceSlots || (listener.sourceSlots = []);
  const observers = computed.observers || (computed.observers = []);
  const observerSlots = computed.observerSlots || (computed.observerSlots = []);

  // Add to listener's sources
  const sourceIndex = sources.length;
  sources.push(computed);

  // Add to computed's observers
  const observerIndex = observers.length;
  observers.push(listener);

  // ✅ Bidirectional slots
  sourceSlots.push(observerIndex);
  observerSlots.push(sourceIndex);

  // Update references
  listener.sources = sources;
  listener.sourceSlots = sourceSlots;
  computed.observers = observers;
  computed.observerSlots = observerSlots;
}

// ============================================================================
// Timestamp-based Update Check (from V4)
// ============================================================================

function needsUpdate(node: CNode<any>): boolean {
  if (node.updatedAt === null) return true;

  if (node.sources) {
    for (let i = 0; i < node.sources.length; i++) {
      const source = node.sources[i];

      // Check if computed source
      if ('fn' in source) {
        const csrc = source as CNode<any>;
        if (needsUpdate(csrc)) {
          update(csrc);
        }
        if (csrc.updatedAt && csrc.updatedAt > node.updatedAt) {
          return true;
        }
      } else {
        // Signal source
        if (source.updatedAt > node.updatedAt) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * ✅ Update with permanent dependencies
 */
function update<T>(node: CNode<T>): void {
  const isFirstRun = node.sources === null;

  let prevListener = null;
  if (isFirstRun) {
    prevListener = Listener;
    Listener = node;
  }

  let newValue: T;
  try {
    newValue = node.fn();
  } finally {
    if (isFirstRun) {
      Listener = prevListener;
    }
  }

  // Update value and timestamp
  const old = node.value;
  node.value = newValue;

  // ✅ Only increment ExecCount if value actually changed
  if (old === null || !node.equals(newValue, old)) {
    node.updatedAt = ++ExecCount;
  } else {
    // Value didn't change - update timestamp but don't increment ExecCount
    // This ensures our timestamp is fresh without triggering downstream
    node.updatedAt = ExecCount;
  }
}

// ============================================================================
// O(1) Cleanup with Bidirectional Slots
// ============================================================================

/**
 * ✅ O(1) cleanup using bidirectional slots
 *
 * Key insight from SolidJS:
 * - We know exactly where each observer is in source.observers (via sourceSlots)
 * - We can swap-and-pop in O(1) instead of O(n) indexOf
 *
 * Example:
 *   listener.sources = [a, b, c]
 *   listener.sourceSlots = [0, 1, 2]  <- listener is at index 0 in a.observers,
 *                                        index 1 in b.observers, etc.
 *
 * When removing 'b':
 *   1. index = sourceSlots[1] = 1  (listener is at index 1 in b.observers)
 *   2. Swap b.observers[1] with last element
 *   3. Update the swapped element's slot
 *   4. Pop from array
 *
 * Result: O(1) per edge instead of O(n)
 */
function cleanSources(node: CNode<any>): void {
  const srcs = node.sources;
  const slots = node.sourceSlots;

  if (!srcs || !slots) return;

  // Clean all dependencies
  while (srcs.length > 0) {
    const source = srcs.pop()!;
    const slotIndex = slots.pop()!;

    const obs = source.observers;
    const obsSlots = source.observerSlots;

    if (!obs || !obsSlots) continue;

    // ✅ O(1) swap-and-pop using slots
    const lastObs = obs.pop()!;
    const lastSlot = obsSlots.pop()!;

    // If we're not removing the last element, swap it in
    if (slotIndex < obs.length) {
      obs[slotIndex] = lastObs;
      obsSlots[slotIndex] = lastSlot;

      // ✅ Update the swapped observer's slot to point to new location
      if (lastObs.sourceSlots) {
        lastObs.sourceSlots[lastSlot] = slotIndex;
      }
    }

    // Clean up empty arrays
    if (obs.length === 0) {
      source.observers = null;
      source.observerSlots = null;
    }
  }

  node.sources = null;
  node.sourceSlots = null;
}

// ============================================================================
// Effect
// ============================================================================

function createEffect(fn: () => void): Computed<null> {
  return computed(fn, () => true);
}

// ============================================================================
// Batch
// ============================================================================

let _batchDepth = 0;

export function batch<T>(fn: () => T): T {
  _batchDepth++;
  try {
    return fn();
  } finally {
    _batchDepth--;
  }
}

// ============================================================================
// Export
// ============================================================================

export const zenV8 = {
  signal,
  computed,
  batch,
};

/**
 * Zen V10-Hybrid - Static Dependencies + Push-based
 *
 * 混合架構：
 * - 保持 Zen 的 static dependencies (first-run only tracking)
 * - 但採用 push-based 更新機制
 * - 避免 dynamic dependencies 的清理開銷
 */

// ============================================================================
// Constants
// ============================================================================
const CLEAN = 0;
const STALE = 1;

// ============================================================================
// Types
// ============================================================================

export type Signal<T> = {
  (): T;
  (value: T): void;
  set: (value: T) => void;
  _node: SNode<T>;
};

export type Computed<T> = {
  (): T;
  _node: CNode<T>;
};

type SNode<T> = {
  value: T;
  observers: CNode<any>[] | null;
};

type CNode<T> = {
  fn: () => T;
  value: T;
  state: number;
  sources: (SNode<any> | CNode<any>)[] | null;
  observers: CNode<any>[] | null;
  isFirstRun: boolean;
};

// ============================================================================
// Global State
// ============================================================================
let Listener: CNode<any> | null = null;

// ============================================================================
// Helper Functions
// ============================================================================

function markDownstream(node: CNode<any>): void {
  node.state = STALE;
  const observers = node.observers;
  if (observers) {
    for (let i = 0; i < observers.length; i++) {
      markDownstream(observers[i]);
    }
  }
}

// ============================================================================
// Static Tracking Functions
// ============================================================================

function trackDependency<T>(listener: CNode<any>, source: SNode<T>): void {
  // Static tracking - 只在第一次運行時追蹤
  if (!listener.isFirstRun) return;

  const sources = listener.sources!;
  sources.push(source);

  const observers = source.observers;
  if (!observers) {
    source.observers = [listener];
  } else {
    observers.push(listener);
  }
}

// ============================================================================
// Signal Implementation
// ============================================================================

export function signal<T>(initialValue: T): Signal<T> {
  const node: SNode<T> = {
    value: initialValue,
    observers: null,
  };

  const getter = (): T => {
    if (Listener) {
      trackDependency(Listener, node);
    }
    return node.value;
  };

  const setter = (newValue: T): void => {
    if (node.value === newValue) return;

    node.value = newValue;

    // Push-based 遞歸標記
    const observers = node.observers;
    if (observers) {
      for (let i = 0; i < observers.length; i++) {
        markDownstream(observers[i]);
      }
    }
  };

  const fn = ((value?: T): T | undefined => {
    if (arguments.length === 0) {
      return getter();
    }
    setter(value!);
    return undefined;
  }) as Signal<T>;

  fn.set = setter;
  fn._node = node;

  return fn;
}

// ============================================================================
// Computed Implementation
// ============================================================================

export function computed<T>(fn: () => T): Computed<T> {
  const node: CNode<T> = {
    fn,
    value: null as T,
    state: STALE,
    sources: [],
    observers: null,
    isFirstRun: true,
  };

  const getter = (): T => {
    if (node.state === STALE) {
      // 遞歸更新所有 STALE 的上游
      const sources = node.sources;
      if (sources) {
        for (let i = 0; i < sources.length; i++) {
          const source = sources[i];
          const csrc = source as CNode<any>;
          if (csrc.fn && csrc.state === STALE) {
            csrc.fn(); // This will trigger its own update
          }
        }
      }

      // 重新計算
      const prevListener = Listener;
      Listener = node;

      node.value = node.fn();

      Listener = prevListener;
      node.state = CLEAN;
    }

    // 追蹤依賴
    if (Listener) {
      trackDependency(Listener, node);
    }

    return node.value;
  };

  const computedFn = getter as Computed<T>;
  computedFn._node = node;

  return computedFn;
}

// ============================================================================
// Batch
// ============================================================================

export function batch<T>(fn: () => T): T {
  return fn();
}

// ============================================================================
// Export
// ============================================================================

export const zenV10Hybrid = {
  signal,
  computed,
  batch,
};

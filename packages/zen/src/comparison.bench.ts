/**
 * Comprehensive benchmark comparing:
 * - Zen (our library)
 * - Solid Signals
 * - Preact Signals
 * - Jotai
 * - Zustand
 *
 * Tests all core features across libraries
 */

import { bench, describe } from 'vitest';

// Zen
import { computed, get, set, subscribe, zen } from './index';

// Solid Signals
import { createEffect, createMemo, createSignal } from 'solid-js';

// Preact Signals
import {
  computed as preactComputed,
  effect as preactEffect,
  signal as preactSignal,
} from '@preact/signals-core';

// Jotai
import { createStore as createJotaiStore, atom as jotaiAtom } from 'jotai';

// Zustand
import { createStore as createZustandStore } from 'zustand/vanilla';

// ============================================================================
// 1. Simple Read/Write Performance
// ============================================================================

describe('Simple Read/Write', () => {
  bench('Zen', () => {
    const $count = zen(0);
    for (let i = 0; i < 1000; i++) {
      set($count, get($count) + 1);
    }
  });

  bench('Solid Signals', () => {
    const [count, setCount] = createSignal(0);
    for (let i = 0; i < 1000; i++) {
      setCount(count() + 1);
    }
  });

  bench('Preact Signals', () => {
    const count = preactSignal(0);
    for (let i = 0; i < 1000; i++) {
      count.value = count.value + 1;
    }
  });

  bench('Jotai', () => {
    const store = createJotaiStore();
    const countAtom = jotaiAtom(0);
    for (let i = 0; i < 1000; i++) {
      store.set(countAtom, store.get(countAtom) + 1);
    }
  });

  bench('Zustand', () => {
    const store = createZustandStore<{ count: number }>((_set, _get) => ({
      count: 0,
    }));
    for (let i = 0; i < 1000; i++) {
      store.setState({ count: get().count + 1 });
    }
  });
});

// ============================================================================
// 2. Computed/Derived Values
// ============================================================================

describe('Computed Values', () => {
  bench('Zen', () => {
    const $count = zen(0);
    const $double = computed([$count], (n) => n * 2);

    for (let i = 0; i < 1000; i++) {
      set($count, i);
      get($double); // Access computed
    }
  });

  bench('Solid Signals', () => {
    const [count, setCount] = createSignal(0);
    const double = createMemo(() => count() * 2);

    for (let i = 0; i < 1000; i++) {
      setCount(i);
      double(); // Access memo
    }
  });

  bench('Preact Signals', () => {
    const count = preactSignal(0);
    const double = preactComputed(() => count.value * 2);

    for (let i = 0; i < 1000; i++) {
      count.value = i;
      double.value; // Access computed
    }
  });

  bench('Jotai', () => {
    const store = createJotaiStore();
    const countAtom = jotaiAtom(0);
    const doubleAtom = jotaiAtom((get) => get(countAtom) * 2);

    for (let i = 0; i < 1000; i++) {
      store.set(countAtom, i);
      store.get(doubleAtom); // Access derived
    }
  });

  bench('Zustand (manual compute)', () => {
    const store = createZustandStore<{ count: number; double: number }>((_set, _get) => ({
      count: 0,
      double: 0,
    }));

    for (let i = 0; i < 1000; i++) {
      store.setState({ count: i, double: i * 2 });
      store.getState().double;
    }
  });
});

// ============================================================================
// 3. Subscriptions (1 subscriber)
// ============================================================================

describe('Subscriptions (1 subscriber)', () => {
  bench('Zen', () => {
    const $count = zen(0);
    let _callCount = 0;

    const unsub = subscribe($count, () => {
      _callCount++;
    });

    for (let i = 0; i < 1000; i++) {
      set($count, i);
    }

    unsub();
  });

  bench('Solid Signals', () => {
    const [count, setCount] = createSignal(0);
    let _callCount = 0;

    const _dispose = createEffect(() => {
      count(); // Track
      _callCount++;
    });

    for (let i = 0; i < 1000; i++) {
      setCount(i);
    }
  });

  bench('Preact Signals', () => {
    const count = preactSignal(0);
    let _callCount = 0;

    const dispose = preactEffect(() => {
      count.value; // Track
      _callCount++;
    });

    for (let i = 0; i < 1000; i++) {
      count.value = i;
    }

    dispose();
  });

  bench('Jotai', () => {
    const store = createJotaiStore();
    const countAtom = jotaiAtom(0);
    let _callCount = 0;

    const unsub = store.sub(countAtom, () => {
      _callCount++;
    });

    for (let i = 0; i < 1000; i++) {
      store.set(countAtom, i);
    }

    unsub();
  });

  bench('Zustand', () => {
    const store = createZustandStore<{ count: number }>((_set) => ({
      count: 0,
    }));
    let _callCount = 0;

    const unsub = store.subscribe(() => {
      _callCount++;
    });

    for (let i = 0; i < 1000; i++) {
      store.setState({ count: i });
    }

    unsub();
  });
});

// ============================================================================
// 4. Multiple Subscribers (10 subscribers)
// ============================================================================

describe('Multiple Subscribers (10 subscribers)', () => {
  bench('Zen', () => {
    const $count = zen(0);
    const unsubs: Array<() => void> = [];

    for (let i = 0; i < 10; i++) {
      unsubs.push(subscribe($count, () => {}));
    }

    for (let i = 0; i < 1000; i++) {
      set($count, i);
    }

    unsubs.forEach((u) => u());
  });

  bench('Solid Signals', () => {
    const [count, setCount] = createSignal(0);

    for (let i = 0; i < 10; i++) {
      createEffect(() => {
        count();
      });
    }

    for (let i = 0; i < 1000; i++) {
      setCount(i);
    }
  });

  bench('Preact Signals', () => {
    const count = preactSignal(0);
    const disposes: Array<() => void> = [];

    for (let i = 0; i < 10; i++) {
      disposes.push(
        preactEffect(() => {
          count.value;
        }),
      );
    }

    for (let i = 0; i < 1000; i++) {
      count.value = i;
    }

    disposes.forEach((d) => d());
  });

  bench('Jotai', () => {
    const store = createJotaiStore();
    const countAtom = jotaiAtom(0);
    const unsubs: Array<() => void> = [];

    for (let i = 0; i < 10; i++) {
      unsubs.push(store.sub(countAtom, () => {}));
    }

    for (let i = 0; i < 1000; i++) {
      store.set(countAtom, i);
    }

    unsubs.forEach((u) => u());
  });

  bench('Zustand', () => {
    const store = createZustandStore<{ count: number }>((_set) => ({
      count: 0,
    }));
    const unsubs: Array<() => void> = [];

    for (let i = 0; i < 10; i++) {
      unsubs.push(store.subscribe(() => {}));
    }

    for (let i = 0; i < 1000; i++) {
      store.setState({ count: i });
    }

    unsubs.forEach((u) => u());
  });
});

// ============================================================================
// 5. Diamond Dependency (computed chains)
// ============================================================================

describe('Diamond Dependency', () => {
  bench('Zen', () => {
    const $a = zen(0);
    const $b = computed([$a], (a) => a * 2);
    const $c = computed([$a], (a) => a + 1);
    const $d = computed([$b, $c], (b, c) => b + c);

    for (let i = 0; i < 1000; i++) {
      set($a, i);
      get($d);
    }
  });

  bench('Solid Signals', () => {
    const [a, setA] = createSignal(0);
    const b = createMemo(() => a() * 2);
    const c = createMemo(() => a() + 1);
    const d = createMemo(() => b() + c());

    for (let i = 0; i < 1000; i++) {
      setA(i);
      d();
    }
  });

  bench('Preact Signals', () => {
    const a = preactSignal(0);
    const b = preactComputed(() => a.value * 2);
    const c = preactComputed(() => a.value + 1);
    const d = preactComputed(() => b.value + c.value);

    for (let i = 0; i < 1000; i++) {
      a.value = i;
      d.value;
    }
  });

  bench('Jotai', () => {
    const store = createJotaiStore();
    const aAtom = jotaiAtom(0);
    const bAtom = jotaiAtom((get) => get(aAtom) * 2);
    const cAtom = jotaiAtom((get) => get(aAtom) + 1);
    const dAtom = jotaiAtom((get) => get(bAtom) + get(cAtom));

    for (let i = 0; i < 1000; i++) {
      store.set(aAtom, i);
      store.get(dAtom);
    }
  });

  bench('Zustand (manual compute)', () => {
    const store = createZustandStore<{ a: number; b: number; c: number; d: number }>(
      (_set, _get) => ({
        a: 0,
        b: 0,
        c: 0,
        d: 0,
      }),
    );

    for (let i = 0; i < 1000; i++) {
      const a = i;
      const b = a * 2;
      const c = a + 1;
      const d = b + c;
      store.setState({ a, b, c, d });
      store.getState().d;
    }
  });
});

// ============================================================================
// 6. Creation/Disposal Performance
// ============================================================================

describe('Creation/Disposal', () => {
  bench('Zen - create & dispose', () => {
    for (let i = 0; i < 1000; i++) {
      const $count = zen(0);
      const $double = computed([$count], (n) => n * 2);
      const unsub = subscribe($double, () => {});
      unsub();
    }
  });

  bench('Solid Signals - create & dispose', () => {
    for (let i = 0; i < 1000; i++) {
      const [count, _setCount] = createSignal(0);
      const double = createMemo(() => count() * 2);
      createEffect(() => {
        double();
      });
    }
  });

  bench('Preact Signals - create & dispose', () => {
    for (let i = 0; i < 1000; i++) {
      const count = preactSignal(0);
      const double = preactComputed(() => count.value * 2);
      const dispose = preactEffect(() => {
        double.value;
      });
      dispose();
    }
  });

  bench('Jotai - create & dispose', () => {
    for (let i = 0; i < 1000; i++) {
      const store = createJotaiStore();
      const countAtom = jotaiAtom(0);
      const doubleAtom = jotaiAtom((get) => get(countAtom) * 2);
      const unsub = store.sub(doubleAtom, () => {});
      unsub();
    }
  });

  bench('Zustand - create & dispose', () => {
    for (let i = 0; i < 1000; i++) {
      const store = createZustandStore<{ count: number }>(() => ({
        count: 0,
      }));
      const unsub = store.subscribe(() => {});
      unsub();
    }
  });
});

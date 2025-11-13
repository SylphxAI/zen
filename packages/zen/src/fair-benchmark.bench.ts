/**
 * Fair Benchmark Suite: Zen v3.1.1 vs Zen v3.2 vs SolidJS
 *
 * This benchmark compares three implementations using the same test conditions:
 * 1. Current Zen v3.1.1 (dist/index.js - production build)
 * 2. Optimized Zen v3.2 (new implementation)
 * 3. SolidJS signals
 *
 * All tests run with vitest to ensure fair measurement.
 */

import { batch, createEffect, createMemo, createSignal } from 'solid-js';
import { bench, describe } from 'vitest';

// Import current zen v3.1.1 from dist (production build)
import {
  batch as currentBatch,
  computed as currentComputed,
  effect as currentEffect,
  zen as currentZen,
} from '../dist/index.js';

// Import optimized zen v3.2 implementation
import {
  batch as optimizedBatch,
  computed as optimizedComputed,
  effect as optimizedEffect,
  zen as optimizedZen,
} from './zen';

// ========================================
// SETUP HELPERS
// ========================================

function createSignalSet(count: number) {
  return {
    solid: Array.from({ length: count }, () => createSignal(0)),
    current: Array.from({ length: count }, () => currentZen(0)),
    optimized: Array.from({ length: count }, () => optimizedZen(0)),
  };
}

function createDependencyChain(depth: number) {
  // SolidJS chain
  const solidSignals = Array.from({ length: depth }, () => createSignal(1));
  const solidComputeds = [];
  for (let i = 1; i < depth; i++) {
    const prev = solidSignals[i - 1][0];
    solidComputeds.push(createMemo(() => prev() * 2));
  }

  // Current Zen v3.1.1 chain
  const currentSignals = Array.from({ length: depth }, () => currentZen(1));
  const currentComputeds = [];
  for (let i = 1; i < depth; i++) {
    const prev = currentSignals[i - 1];
    currentComputeds.push(currentComputed([prev], (val) => (val as number) * 2));
  }

  // Optimized Zen v3.2 chain
  const optimizedSignals = Array.from({ length: depth }, () => optimizedZen(1));
  const optimizedComputeds = [];
  for (let i = 1; i < depth; i++) {
    const prev = optimizedSignals[i - 1];
    optimizedComputeds.push(optimizedComputed([prev], (val) => (val as number) * 2));
  }

  return {
    solidSignals,
    solidComputeds,
    currentSignals,
    currentComputeds,
    optimizedSignals,
    optimizedComputeds,
  };
}

// ========================================
// CREATION BENCHMARKS
// ========================================

describe('🏃‍♂️ Signal Creation Performance', () => {
  bench('SolidJS createSignal (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      createSignal(i);
    }
  });

  bench('Zen v3.1.1 zen (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      currentZen(i);
    }
  });

  bench('Zen v3.2 optimized (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      optimizedZen(i);
    }
  });
});

describe('🧮 Computed Creation Performance', () => {
  const solidBase = createSignal(10);
  const currentBase = currentZen(10);
  const optimizedBase = optimizedZen(10);

  bench('SolidJS createMemo (x100)', () => {
    for (let i = 0; i < 100; i++) {
      createMemo(() => solidBase[0]() * i);
    }
  });

  bench('Zen v3.1.1 computed (x100)', () => {
    for (let i = 0; i < 100; i++) {
      currentComputed([currentBase], (val) => (val as number) * i);
    }
  });

  bench('Zen v3.2 optimized computed (x100)', () => {
    for (let i = 0; i < 100; i++) {
      optimizedComputed([optimizedBase], (val) => (val as number) * i);
    }
  });
});

// ========================================
// READ PERFORMANCE BENCHMARKS
// ========================================

describe('📖 Signal Read Performance', () => {
  const { solid, current, optimized } = createSignalSet(100);

  bench('SolidJS signal reads (x100 signals)', () => {
    let sum = 0;
    for (let i = 0; i < 100; i++) {
      sum += solid[i][0]();
    }
    return sum;
  });

  bench('Zen v3.1.1 signal reads (x100 signals)', () => {
    let sum = 0;
    for (let i = 0; i < 100; i++) {
      sum += current[i].value;
    }
    return sum;
  });

  bench('Zen v3.2 optimized reads (x100 signals)', () => {
    let sum = 0;
    for (let i = 0; i < 100; i++) {
      sum += optimized[i].value;
    }
    return sum;
  });
});

describe('📊 Computed Read Performance', () => {
  const solidBase = createSignal(42);
  const solidComputed = createMemo(() => solidBase[0]() * 2);

  const currentBase = currentZen(42);
  const currentComputed = currentComputed([currentBase], (val) => (val as number) * 2);

  const optimizedBase = optimizedZen(42);
  const optimizedComputed = optimizedComputed([optimizedBase], (val) => (val as number) * 2);

  bench('SolidJS computed reads (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      solidComputed();
    }
  });

  bench('Zen v3.1.1 computed reads (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      currentComputed.value;
    }
  });

  bench('Zen v3.2 optimized computed reads (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      optimizedComputed.value;
    }
  });
});

// ========================================
// WRITE PERFORMANCE BENCHMARKS
// ========================================

describe('✍️ Signal Write Performance', () => {
  const { solid, current, optimized } = createSignalSet(100);
  let counter = 0;

  bench('SolidJS signal writes (x100 signals)', () => {
    for (let i = 0; i < 100; i++) {
      solid[i][1](++counter);
    }
  });

  bench('Zen v3.1.1 signal writes (x100 signals)', () => {
    for (let i = 0; i < 100; i++) {
      current[i].value = ++counter;
    }
  });

  bench('Zen v3.2 optimized writes (x100 signals)', () => {
    for (let i = 0; i < 100; i++) {
      optimized[i].value = ++counter;
    }
  });
});

// ========================================
// DEPENDENCY TRACKING BENCHMARKS
// ========================================

describe('🔗 Dependency Tracking Performance', () => {
  const {
    solidSignals,
    solidComputeds,
    currentSignals,
    currentComputeds,
    optimizedSignals,
    optimizedComputeds,
  } = createDependencyChain(20);

  // Setup listeners
  let solidUpdates = 0;
  let currentUpdates = 0;
  let optimizedUpdates = 0;

  if (solidComputeds.length > 0) {
    createEffect(() => {
      solidComputeds[solidComputeds.length - 1]();
      solidUpdates++;
    });
  }

  if (currentComputeds.length > 0) {
    currentEffect(() => {
      currentComputeds[currentComputeds.length - 1].value;
      currentUpdates++;
    });
  }

  if (optimizedComputeds.length > 0) {
    optimizedEffect(() => {
      optimizedComputeds[optimizedComputeds.length - 1].value;
      optimizedUpdates++;
    });
  }

  bench('SolidJS dependency propagation', () => {
    solidUpdates = 0;
    solidSignals[0][1](2);
    return solidUpdates;
  });

  bench('Zen v3.1.1 dependency propagation', () => {
    currentUpdates = 0;
    currentSignals[0].value = 2;
    return currentUpdates;
  });

  bench('Zen v3.2 optimized dependency propagation', () => {
    optimizedUpdates = 0;
    optimizedSignals[0].value = 2;
    return optimizedUpdates;
  });
});

// ========================================
// BATCH PERFORMANCE BENCHMARKS
// ========================================

describe('📦 Batch Update Performance', () => {
  const { solid, current, optimized } = createSignalSet(50);

  // Setup listeners
  solid.forEach(([signal]) => {
    createEffect(() => signal());
  });

  current.forEach((signal) => {
    currentEffect(() => signal.value);
  });

  optimized.forEach((signal) => {
    optimizedEffect(() => signal.value);
  });

  bench('SolidJS batch updates (50 signals)', () => {
    batch(() => {
      for (let i = 0; i < 50; i++) {
        solid[i][1](i * 2);
      }
    });
  });

  bench('Zen v3.1.1 batch updates (50 signals)', () => {
    currentBatch(() => {
      for (let i = 0; i < 50; i++) {
        current[i].value = i * 2;
      }
    });
  });

  bench('Zen v3.2 optimized batch (50 signals)', () => {
    optimizedBatch(() => {
      for (let i = 0; i < 50; i++) {
        optimized[i].value = i * 2;
      }
    });
  });
});

// ========================================
// SUBSCRIPTION PERFORMANCE BENCHMARKS
// ========================================

describe('👂 Subscription Performance', () => {
  const _noop = () => {};

  bench('SolidJS effect subscription (x100)', () => {
    for (let i = 0; i < 100; i++) {
      const [signal] = createSignal(0);
      const unsub = createEffect(() => signal());
      unsub();
    }
  });

  bench('Zen v3.1.1 effect subscription (x100)', () => {
    for (let i = 0; i < 100; i++) {
      const signal = currentZen(0);
      const unsub = currentEffect(() => signal.value);
      unsub();
    }
  });

  bench('Zen v3.2 optimized subscription (x100)', () => {
    for (let i = 0; i < 100; i++) {
      const signal = optimizedZen(0);
      const unsub = optimizedEffect(() => signal.value);
      unsub();
    }
  });
});

// ========================================
// COMPLEX DEPENDENCY NETWORKS
// ========================================

describe('🕸️ Complex Network Performance', () => {
  const networkSize = 50;

  // Create complex networks with cross-dependencies
  const solidNetwork = Array.from({ length: networkSize }, () => createSignal(0));
  const currentNetwork = Array.from({ length: networkSize }, () => currentZen(0));
  const optimizedNetwork = Array.from({ length: networkSize }, () => optimizedZen(0));

  // Create computed values with multiple dependencies
  const createComputeds = (sources: any[], createFn: any) => {
    const computeds = [];
    for (let i = 0; i < networkSize / 2; i++) {
      const depsCount = Math.floor(Math.random() * 3) + 2;
      const deps = [];
      for (let j = 0; j < depsCount; j++) {
        const idx = Math.floor(Math.random() * networkSize);
        deps.push(sources[idx]);
      }
      computeds.push(
        createFn(deps, (...values: any[]) =>
          values.reduce((sum: number, val: any) => sum + (val as number), 0),
        ),
      );
    }
    return computeds;
  };

  const solidComputeds = createComputeds(
    solidNetwork.map(([s]) => s),
    (deps: any[], fn: any) => createMemo(() => fn(...deps.map((d: any) => d()))),
  );

  const currentComputeds = createComputeds(currentNetwork, currentComputed);

  const optimizedComputeds = createComputeds(optimizedNetwork, optimizedComputed);

  bench('SolidJS complex network updates', () => {
    for (let i = 0; i < 20; i++) {
      solidNetwork[i][1](Math.random() * 100);
    }
    solidComputeds.forEach((comp) => comp());
  });

  bench('Zen v3.1.1 complex network updates', () => {
    for (let i = 0; i < 20; i++) {
      currentNetwork[i].value = Math.random() * 100;
    }
    currentComputeds.forEach((comp) => comp.value);
  });

  bench('Zen v3.2 optimized complex network updates', () => {
    for (let i = 0; i < 20; i++) {
      optimizedNetwork[i].value = Math.random() * 100;
    }
    optimizedComputeds.forEach((comp) => comp.value);
  });
});

// ========================================
// HIGH-FREQUENCY UPDATES
// ========================================

describe('⚡ High-Frequency Updates', () => {
  const solidSignal = createSignal(0);
  const currentSignal = currentZen(0);
  const optimizedSignal = optimizedZen(0);

  bench('SolidJS rapid updates (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      solidSignal[1](i);
    }
  });

  bench('Zen v3.1.1 rapid updates (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      currentSignal.value = i;
    }
  });

  bench('Zen v3.2 optimized rapid updates (x1000)', () => {
    for (let i = 0; i < 1000; i++) {
      optimizedSignal.value = i;
    }
  });
});

/*
Expected Performance Improvements:

Zen v3.2 should show:
- 20-40% improvement over Zen v3.1.1
- 2-3x improvement over SolidJS in dependency tracking
- Better memory efficiency
- Faster batch operations

Key areas where v3.2 should excel:
1. Dependency tracking (O(1) vs O(n))
2. Memory allocation patterns
3. Batch update efficiency
4. Complex network performance

All tests run with identical conditions to ensure fair comparison.
The current v3.1.1 uses the production build from dist/ for accurate comparison.
*/

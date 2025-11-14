/**
 * Benchmark: Runtime-only vs Compiled Graph
 *
 * Compares performance of:
 * 1. Runtime tracking (current v3.8 approach)
 * 2. Compiled graph (v3.9 compiler optimization)
 */

import { describe, expect, test } from 'vitest';
import { zen, computed, batch } from './index';
import { createCompiledGraph } from './compiled';
import type { CompiledGraph } from './compiled';

describe('Compiled vs Runtime Benchmark', () => {
  test('Simple computed - Runtime vs Compiled', () => {
    const iterations = 10000;

    // === Runtime-only approach ===
    const startRuntime = performance.now();

    const countRuntime = zen(0);
    const doubledRuntime = computed(() => countRuntime.value * 2);

    for (let i = 0; i < iterations; i++) {
      countRuntime.value = i;
      const _ = doubledRuntime.value; // Force computation
    }

    const runtimeTime = performance.now() - startRuntime;

    // === Compiled approach ===
    const graph: CompiledGraph = {
      signals: [{ id: 0, value: 0 }],
      computed: [
        {
          id: 1,
          deps: [0],
          fn: (count) => count * 2,
        },
      ],
      executionOrder: [0, 1],
    };

    const startCompiled = performance.now();

    const compiledRuntime = createCompiledGraph(graph);

    for (let i = 0; i < iterations; i++) {
      compiledRuntime.setValue(0, i);
      const _ = compiledRuntime.getValue(1);
    }

    const compiledTime = performance.now() - startCompiled;

    // Results
    const speedup = ((runtimeTime - compiledTime) / runtimeTime) * 100;

    console.log('\n=== Simple Computed Benchmark ===');
    console.log(`Runtime-only: ${runtimeTime.toFixed(2)}ms`);
    console.log(`Compiled:     ${compiledTime.toFixed(2)}ms`);
    console.log(`Speedup:      ${speedup.toFixed(1)}%`);
    console.log(`Faster:       ${speedup > 0 ? '✅ Compiled' : '❌ Runtime'}`);

    expect(compiledTime).toBeLessThan(runtimeTime * 1.5); // At least not slower
  });

  test('Diamond dependency - Runtime vs Compiled', () => {
    const iterations = 5000;

    // === Runtime-only approach ===
    const startRuntime = performance.now();

    const a = zen(1);
    const b = zen(2);
    const left = computed(() => a.value * 2);
    const right = computed(() => b.value * 3);
    const merge = computed(() => left.value + right.value);

    for (let i = 0; i < iterations; i++) {
      batch(() => {
        a.value = i;
        b.value = i + 1;
      });
      const _ = merge.value;
    }

    const runtimeTime = performance.now() - startRuntime;

    // === Compiled approach ===
    const graph: CompiledGraph = {
      signals: [
        { id: 0, value: 1 }, // a
        { id: 1, value: 2 }, // b
      ],
      computed: [
        { id: 2, deps: [0], fn: (a) => a * 2 },           // left
        { id: 3, deps: [1], fn: (b) => b * 3 },           // right
        { id: 4, deps: [2, 3], fn: (left, right) => left + right }, // merge
      ],
      executionOrder: [0, 1, 2, 3, 4],
    };

    const startCompiled = performance.now();

    const compiledRuntime = createCompiledGraph(graph);

    for (let i = 0; i < iterations; i++) {
      compiledRuntime.setValue(0, i);
      compiledRuntime.setValue(1, i + 1);
      const _ = compiledRuntime.getValue(4); // merge
    }

    const compiledTime = performance.now() - startCompiled;

    // Results
    const speedup = ((runtimeTime - compiledTime) / runtimeTime) * 100;

    console.log('\n=== Diamond Dependency Benchmark ===');
    console.log(`Runtime-only: ${runtimeTime.toFixed(2)}ms`);
    console.log(`Compiled:     ${compiledTime.toFixed(2)}ms`);
    console.log(`Speedup:      ${speedup.toFixed(1)}%`);
    console.log(`Faster:       ${speedup > 0 ? '✅ Compiled' : '❌ Runtime'}`);

    expect(compiledTime).toBeLessThan(runtimeTime * 1.5);
  });

  test('Deep chain - Runtime vs Compiled', () => {
    const iterations = 3000;

    // === Runtime-only approach ===
    const startRuntime = performance.now();

    const base = zen(0);
    const chain1 = computed(() => base.value + 1);
    const chain2 = computed(() => chain1.value + 1);
    const chain3 = computed(() => chain2.value + 1);
    const chain4 = computed(() => chain3.value + 1);
    const chain5 = computed(() => chain4.value + 1);

    for (let i = 0; i < iterations; i++) {
      base.value = i;
      const _ = chain5.value;
    }

    const runtimeTime = performance.now() - startRuntime;

    // === Compiled approach ===
    const graph: CompiledGraph = {
      signals: [{ id: 0, value: 0 }],
      computed: [
        { id: 1, deps: [0], fn: (v) => v + 1 },
        { id: 2, deps: [1], fn: (v) => v + 1 },
        { id: 3, deps: [2], fn: (v) => v + 1 },
        { id: 4, deps: [3], fn: (v) => v + 1 },
        { id: 5, deps: [4], fn: (v) => v + 1 },
      ],
      executionOrder: [0, 1, 2, 3, 4, 5],
    };

    const startCompiled = performance.now();

    const compiledRuntime = createCompiledGraph(graph);

    for (let i = 0; i < iterations; i++) {
      compiledRuntime.setValue(0, i);
      const _ = compiledRuntime.getValue(5);
    }

    const compiledTime = performance.now() - startCompiled;

    // Results
    const speedup = ((runtimeTime - compiledTime) / runtimeTime) * 100;

    console.log('\n=== Deep Chain Benchmark ===');
    console.log(`Runtime-only: ${runtimeTime.toFixed(2)}ms`);
    console.log(`Compiled:     ${compiledTime.toFixed(2)}ms`);
    console.log(`Speedup:      ${speedup.toFixed(1)}%`);
    console.log(`Faster:       ${speedup > 0 ? '✅ Compiled' : '❌ Runtime'}`);

    expect(compiledTime).toBeLessThan(runtimeTime * 1.5);
  });

  test('Multiple signals - Runtime vs Compiled', () => {
    const iterations = 5000;

    // === Runtime-only approach ===
    const startRuntime = performance.now();

    const signals = Array.from({ length: 10 }, (_, i) => zen(i));
    const sum = computed(() => signals.reduce((acc, s) => acc + s.value, 0));

    for (let i = 0; i < iterations; i++) {
      batch(() => {
        signals.forEach((s, idx) => {
          s.value = i + idx;
        });
      });
      const _ = sum.value;
    }

    const runtimeTime = performance.now() - startRuntime;

    // === Compiled approach ===
    const graph: CompiledGraph = {
      signals: Array.from({ length: 10 }, (_, i) => ({ id: i, value: i })),
      computed: [
        {
          id: 10,
          deps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          fn: (...values) => values.reduce((acc, v) => acc + v, 0),
        },
      ],
      executionOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };

    const startCompiled = performance.now();

    const compiledRuntime = createCompiledGraph(graph);

    for (let i = 0; i < iterations; i++) {
      for (let idx = 0; idx < 10; idx++) {
        compiledRuntime.setValue(idx, i + idx);
      }
      const _ = compiledRuntime.getValue(10);
    }

    const compiledTime = performance.now() - startCompiled;

    // Results
    const speedup = ((runtimeTime - compiledTime) / runtimeTime) * 100;

    console.log('\n=== Multiple Signals Benchmark ===');
    console.log(`Runtime-only: ${runtimeTime.toFixed(2)}ms`);
    console.log(`Compiled:     ${compiledTime.toFixed(2)}ms`);
    console.log(`Speedup:      ${speedup.toFixed(1)}%`);
    console.log(`Faster:       ${speedup > 0 ? '✅ Compiled' : '❌ Runtime'}`);

    expect(compiledTime).toBeLessThan(runtimeTime * 1.5);
  });
});

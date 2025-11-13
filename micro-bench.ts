/**
 * Micro-benchmark to isolate performance issue
 */

import { zen, computed, batch } from './packages/zen/dist/index.js';
import { createSignal, createMemo, batch as solidBatch } from 'solid-js';

const ITERATIONS = 10_000;

console.log('\n=== Micro-Benchmark: Batching Overhead ===\n');

// Zen
const a1 = zen(1);
const b1 = zen(2);
const c1 = computed([a1, b1], (a, b) => a + b);

console.log('Warming up zen...');
for (let i = 0; i < 1000; i++) {
  batch(() => {
    a1.value = i;
    b1.value = i * 2;
  });
  const _ = c1.value;
}

console.log('Benchmarking zen...');
const zenStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  batch(() => {
    a1.value = i;
    b1.value = i * 2;
  });
  const _ = c1.value;
}
const zenTime = performance.now() - zenStart;

// Solid
const [a2, setA2] = createSignal(1);
const [b2, setB2] = createSignal(2);
const c2 = createMemo(() => a2() + b2());

console.log('Warming up solid...');
for (let i = 0; i < 1000; i++) {
  solidBatch(() => {
    setA2(i);
    setB2(i * 2);
  });
  const _ = c2();
}

console.log('Benchmarking solid...');
const solidStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  solidBatch(() => {
    setA2(i);
    setB2(i * 2);
  });
  const _ = c2();
}
const solidTime = performance.now() - solidStart;

console.log(`\nZen:   ${zenTime.toFixed(2)}ms  (${((ITERATIONS / zenTime) * 1000).toFixed(0)} ops/sec)`);
console.log(`Solid: ${solidTime.toFixed(2)}ms  (${((ITERATIONS / solidTime) * 1000).toFixed(0)} ops/sec)`);
console.log(`\nRatio: ${(zenTime / solidTime).toFixed(2)}x\n`);

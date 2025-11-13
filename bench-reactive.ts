/**
 * Benchmark reactive case (with subscription)
 */

import { zen, computed, batch, subscribe } from './packages/zen/dist/index.js';
import { createSignal, createMemo, batch as solidBatch, createEffect, on } from 'solid-js';

const ITERATIONS = 100_000;

console.log('\n=== Reactive Batching Benchmark ===\n');

// Zen
const a1 = zen(1);
const b1 = zen(2);
const c1 = computed([a1, b1], (a, b) => a + b);

let zenComputeCount = 0;
subscribe(c1, () => {
  zenComputeCount++;
});

console.log('Benchmarking zen (with subscriber)...');
const zenStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  batch(() => {
    a1.value = i;
    b1.value = i * 2;
  });
}
const zenTime = performance.now() - zenStart;

// Solid
const [a2, setA2] = createSignal(1);
const [b2, setB2] = createSignal(2);
const c2 = createMemo(() => a2() + b2());

let solidComputeCount = 0;
createEffect(on(c2, () => {
  solidComputeCount++;
}, { defer: true }));

console.log('Benchmarking solid (with effect)...');
const solidStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  solidBatch(() => {
    setA2(i);
    setB2(i * 2);
  });
}
const solidTime = performance.now() - solidStart;

console.log(`\nZen:   ${zenTime.toFixed(2)}ms  (${((ITERATIONS / zenTime) * 1000).toFixed(0)} ops/sec) - ${zenComputeCount} computes`);
console.log(`Solid: ${solidTime.toFixed(2)}ms  (${((ITERATIONS / solidTime) * 1000).toFixed(0)} ops/sec) - ${solidComputeCount} computes`);
console.log(`\nRatio: ${(zenTime / solidTime).toFixed(2)}x ${zenTime < solidTime ? '✅ FASTER' : '❌ slower'}\n`);

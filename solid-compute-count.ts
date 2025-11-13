/**
 * Count Solid computes
 */

import { createSignal, createMemo, batch } from 'solid-js';

const ITERATIONS = 1000;

const [a, setA] = createSignal(1);
const [b, setB] = createSignal(2);

let computeCount = 0;
const c = createMemo(() => {
  computeCount++;
  return a() + b();
});

console.log(`Running ${ITERATIONS} batched updates...`);

for (let i = 0; i < ITERATIONS; i++) {
  batch(() => {
    setA(i);
    setB(i * 2);
  });
  const _ = c();
}

console.log(`\nTotal iterations: ${ITERATIONS}`);
console.log(`Total computes: ${computeCount}`);
console.log(`Efficiency: ${ITERATIONS} updates / ${computeCount} computes = ${(ITERATIONS / computeCount).toFixed(2)}x reduction\n`);

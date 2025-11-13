/**
 * Count how many times computed actually runs
 */

import { zen, computed, batch } from './packages/zen/dist/index.js';

const ITERATIONS = 1000;

const a = zen(1);
const b = zen(2);

let computeCount = 0;
const c = computed([a, b], (aVal, bVal) => {
  computeCount++;
  return aVal + bVal;
});

// Activate computed by accessing it once
console.log('Activating computed...');
const initial = c.value;
console.log(`Initial value: ${initial}`);
console.log(`Subscribed: ${(c as any)._unsubscribers ? 'YES' : 'NO'}\n`);

computeCount = 0; // Reset counter

console.log(`Running ${ITERATIONS} batched updates...`);

for (let i = 0; i < ITERATIONS; i++) {
  batch(() => {
    a.value = i;
    b.value = i * 2;
  });
  const _ = c.value;
}

console.log(`\nTotal iterations: ${ITERATIONS}`);
console.log(`Total computes: ${computeCount}`);
console.log(`Expected: ${ITERATIONS + 1} (1 initial + ${ITERATIONS} batched)`);
console.log(`Efficiency: ${ITERATIONS} updates / ${computeCount} computes = ${(ITERATIONS / computeCount).toFixed(2)}x reduction\n`);

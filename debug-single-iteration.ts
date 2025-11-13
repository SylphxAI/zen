/**
 * Debug single iteration in detail
 */

import { zen, computed, batch } from './packages/zen/dist/index.js';

const a = zen(1);
const b = zen(2);

let computeCount = 0;
const c = computed([a, b], (aVal, bVal) => {
  computeCount++;
  console.log(`    [COMPUTE #${computeCount}] a=${aVal}, b=${bVal} -> ${aVal + bVal}`);
  return aVal + bVal;
});

console.log('Activating computed...');
const initial = c.value;
console.log(`Initial: ${initial}, subscribed: ${(c as any)._unsubscribers ? 'YES' : 'NO'}\n`);

computeCount = 0;

console.log('Iteration 1:');
console.log(`  Before batch: c._dirty=${(c as any)._dirty}, c._value=${(c as any)._value}`);

batch(() => {
  console.log('    [BATCH] Setting a=10, b=20');
  a.value = 10;
  b.value = 20;
  console.log(`    [BATCH] Inside batch: c._dirty=${(c as any)._dirty}`);
});

console.log(`  After batch: c._dirty=${(c as any)._dirty}, c._value=${(c as any)._value}`);
console.log(`  Accessing c.value...`);
const val1 = c.value;
console.log(`  Got: ${val1}, c._dirty=${(c as any)._dirty}\n`);

computeCount = 0;

console.log('Iteration 2:');
console.log(`  Before batch: c._dirty=${(c as any)._dirty}, c._value=${(c as any)._value}`);

batch(() => {
  console.log('    [BATCH] Setting a=100, b=200');
  a.value = 100;
  b.value = 200;
  console.log(`    [BATCH] Inside batch: c._dirty=${(c as any)._dirty}`);
});

console.log(`  After batch: c._dirty=${(c as any)._dirty}, c._value=${(c as any)._value}`);
console.log(`  Accessing c.value...`);
const val2 = c.value;
console.log(`  Got: ${val2}, c._dirty=${(c as any)._dirty}\n`);

console.log(`Total computes across 2 iterations: ${computeCount}`);

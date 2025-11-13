/**
 * Debug why computed stays dirty after batch
 */

import { zen, computed, batch } from './packages/zen/dist/index.js';

const a = zen(1);
const b = zen(2);

const c = computed([a, b], (aVal, bVal) => {
  console.log(`  [COMPUTE] a=${aVal}, b=${bVal}`);
  return aVal + bVal;
});

console.log('Iteration 1:');
console.log(`  Before batch: c._dirty = ${(c as any)._dirty}`);
batch(() => {
  a.value = 10;
  b.value = 20;
});
console.log(`  After batch: c._dirty = ${(c as any)._dirty}, c._value = ${(c as any)._value}`);
console.log(`  Accessing c.value: ${c.value}`);
console.log(`  After access: c._dirty = ${(c as any)._dirty}`);

console.log('\nIteration 2:');
console.log(`  Before batch: c._dirty = ${(c as any)._dirty}`);
batch(() => {
  a.value = 100;
  b.value = 200;
});
console.log(`  After batch: c._dirty = ${(c as any)._dirty}, c._value = ${(c as any)._value}`);
console.log(`  Accessing c.value: ${c.value}`);
console.log(`  After access: c._dirty = ${(c as any)._dirty}`);

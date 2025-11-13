/**
 * Test if subscribe triggers computation
 */

import { zen, computed, batch, subscribe } from './packages/zen/dist/index.js';

const a = zen(1);
const b = zen(2);

let computeCount = 0;
const c = computed([a, b], (aVal, bVal) => {
  computeCount++;
  console.log(`  [COMPUTE #${computeCount}] a=${aVal}, b=${bVal}`);
  return aVal + bVal;
});

console.log('Before subscribe:');
console.log(`  Compute count: ${computeCount}\n`);

let notifyCount = 0;
subscribe(c, (val) => {
  notifyCount++;
  console.log(`  [NOTIFY #${notifyCount}] value=${val}`);
});

console.log('\nAfter subscribe:');
console.log(`  Compute count: ${computeCount}`);
console.log(`  Notify count: ${notifyCount}\n`);

console.log('Batch update:');
batch(() => {
  a.value = 10;
  b.value = 20;
});

console.log('\nAfter batch:');
console.log(`  Compute count: ${computeCount}`);
console.log(`  Notify count: ${notifyCount}`);

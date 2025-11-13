/**
 * Debug subscription state
 */

import { zen, computed, batch } from './packages/zen/dist/index.js';

const a = zen(1);
const b = zen(2);

const c = computed([a, b], (aVal, bVal) => {
  console.log(`  [COMPUTE] a=${aVal}, b=${bVal}`);
  return aVal + bVal;
});

console.log('After creating computed:');
console.log(`  c._unsubscribers: ${(c as any)._unsubscribers ? 'EXISTS' : 'undefined'}`);
console.log(`  a._listeners: ${a._listeners ? a._listeners.length : 'undefined'}`);
console.log(`  b._listeners: ${b._listeners ? b._listeners.length : 'undefined'}`);

console.log('\nBatch without accessing c first:');
batch(() => {
  console.log('  Setting a=10, b=20');
  a.value = 10;
  b.value = 20;
  console.log(`  a._listeners after set: ${a._listeners ? a._listeners.length : 'undefined'}`);
});

console.log(`\nAfter batch:`);
console.log(`  c._dirty: ${(c as any)._dirty}, c._value: ${(c as any)._value}`);
console.log(`  c._unsubscribers: ${(c as any)._unsubscribers ? 'EXISTS' : 'undefined'}`);

console.log('\nNow accessing c.value:');
const val = c.value;
console.log(`  c.value = ${val}`);
console.log(`  c._unsubscribers after access: ${(c as any)._unsubscribers ? `EXISTS (${(c as any)._unsubscribers.length})` : 'undefined'}`);
console.log(`  a._listeners after access: ${a._listeners ? a._listeners.length : 'undefined'}`);
console.log(`  b._listeners after access: ${b._listeners ? b._listeners.length : 'undefined'}`);

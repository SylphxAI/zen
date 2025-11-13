/**
 * Debug the batch flow step by step
 */

import { zen, computed, batch, subscribe } from './packages/zen/dist/index.js';

console.log('\n=== Debugging Batch Flow ===\n');

const a = zen(1);
const b = zen(2);

console.log('1. Creating computed...');
const c = computed([a, b], (aVal, bVal) => {
  console.log(`   [COMPUTE] a=${aVal}, b=${bVal} -> ${aVal + bVal}`);
  return aVal + bVal;
});

console.log('\n2. Subscribing to computed...');
subscribe(c, (val, oldVal) => {
  console.log(`   [NOTIFY] value changed: ${oldVal} -> ${val}`);
});

console.log('\n3. Checking internal state:');
console.log(`   c._listeners: ${c._listeners?.length || 0} listeners`);
console.log(`   c._unsubscribers: ${c._unsubscribers?.length || 0} unsubscribers`);
console.log(`   a._listeners: ${a._listeners?.length || 0} listeners`);
console.log(`   b._listeners: ${b._listeners?.length || 0} listeners`);

if (a._listeners && a._listeners.length > 0) {
  console.log(`   a._listeners[0]._computedZen: ${(a._listeners[0] as any)._computedZen ? 'EXISTS' : 'MISSING'}`);
}

console.log('\n4. Running batched updates...');
batch(() => {
  console.log('   [BATCH START]');
  console.log('   Setting a = 10');
  a.value = 10;
  console.log('   Setting b = 20');
  b.value = 20;
  console.log('   [BATCH END]');
});

console.log('\n5. After batch - checking state:');
console.log(`   c._dirty: ${c._dirty}`);
console.log(`   c._value: ${c._value}`);
console.log(`   c.value (forcing eval): ${c.value}`);

console.log('\n=== End Debug ===\n');

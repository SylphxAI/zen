/**
 * Debug Updates queue population during batch
 */

import { zen, computed, batch, subscribe } from './packages/zen/dist/index.js';

console.log('\n=== Debugging Updates Queue ===\n');

const a = zen(1);
const b = zen(2);

console.log('1. Creating computed...');
const c = computed([a, b], (aVal, bVal) => {
  console.log(`   [COMPUTE] a=${aVal}, b=${bVal} -> ${aVal + bVal}`);
  return aVal + bVal;
});

console.log('\n2. Subscribing to computed...');
let notificationCount = 0;
subscribe(c, (val, oldVal) => {
  notificationCount++;
  console.log(`   [NOTIFY #${notificationCount}] value changed: ${oldVal} -> ${val}`);
});

console.log('\n3. Checking a._listeners after subscription:');
console.log(`   a._listeners.length: ${a._listeners?.length || 0}`);
if (a._listeners && a._listeners.length > 0) {
  const listener = a._listeners[0] as any;
  console.log(`   a._listeners[0]._computedZen: ${listener._computedZen ? 'EXISTS' : 'MISSING'}`);
  if (listener._computedZen) {
    console.log(`   a._listeners[0]._computedZen._dirty: ${listener._computedZen._dirty}`);
    console.log(`   a._listeners[0]._computedZen === c: ${listener._computedZen === c}`);
  }
}

console.log('\n4. Running batch with manual tracing...');
console.log('   About to call batch()...');

batch(() => {
  console.log('   [INSIDE BATCH] Started');
  console.log('   [INSIDE BATCH] Setting a.value = 10...');
  a.value = 10;
  console.log(`   [INSIDE BATCH] After a.value = 10, c._dirty = ${c._dirty}`);

  console.log('   [INSIDE BATCH] Setting b.value = 20...');
  b.value = 20;
  console.log(`   [INSIDE BATCH] After b.value = 20, c._dirty = ${c._dirty}`);

  console.log('   [INSIDE BATCH] About to exit batch block...');
});

console.log('\n5. After batch completed:');
console.log(`   c._dirty: ${c._dirty}`);
console.log(`   c._value: ${c._value}`);
console.log(`   Notification count: ${notificationCount}`);

console.log('\n6. Forcing evaluation with c.value:');
const finalValue = c.value;
console.log(`   c.value: ${finalValue}`);
console.log(`   Final notification count: ${notificationCount}`);

console.log('\n=== Expected: 2 notifications (initial + batch) ===');
console.log(`=== Actual: ${notificationCount} notifications ===\n`);

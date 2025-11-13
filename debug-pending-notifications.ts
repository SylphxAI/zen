/**
 * Debug what's in pendingNotifications
 */

import { zen, computed, batch, subscribe } from './packages/zen/dist/index.js';

// Monkey-patch batch to log pendingNotifications
const originalBatch = batch as any;

console.log('\n=== Debugging Pending Notifications ===\n');

const a = zen(1);
const b = zen(2);

const c = computed([a, b], (aVal, bVal) => {
  console.log(`   [COMPUTE] a=${aVal}, b=${bVal} -> ${aVal + bVal}`);
  return aVal + bVal;
});

let notificationCount = 0;
subscribe(c, (val, oldVal) => {
  notificationCount++;
  console.log(`   [NOTIFY #${notificationCount}] value changed: ${oldVal} -> ${val}`);
});

console.log('\nRunning batch...');
batch(() => {
  console.log('   [BATCH] Setting a = 10');
  a.value = 10;
  console.log('   [BATCH] Setting b = 20');
  b.value = 20;
  console.log('   [BATCH] Exit batch block');
});

console.log(`\nTotal notifications: ${notificationCount}`);
console.log(`Expected: 2 (initial + batch)`);
console.log(`c._dirty after batch: ${c._dirty}`);
console.log(`c._value after batch: ${c._value}\n`);

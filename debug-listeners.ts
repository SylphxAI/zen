import { zen, computed, batch, subscribe } from './packages/zen/dist/index.js';

const a = zen(1);
const b = zen(2);

let computeCount = 0;
const c = computed([a, b], (aVal, bVal) => {
  computeCount++;
  return aVal + bVal;
});

// Activate by accessing
c.value;
console.log(`After accessing c.value:`);
console.log(`  c._listeners: ${(c as any)._listeners ? (c as any)._listeners.length : 'undefined'}`);
console.log(`  c._unsubscribers: ${(c as any)._unsubscribers ? (c as any)._unsubscribers.length : 'undefined'}\n`);

// Now subscribe
const unsub = subscribe(c, (val) => {
  console.log(`  [LISTENER] c = ${val}`);
});

console.log(`After subscribe(c, ...):`);
console.log(`  c._listeners: ${(c as any)._listeners ? (c as any)._listeners.length : 'undefined'}\n`);

computeCount = 0;

console.log('Running batch...');
batch(() => {
  a.value = 10;
  b.value = 20;
});

console.log(`\nComputes during batch: ${computeCount}`);
console.log(`c._value after batch: ${(c as any)._value}`);

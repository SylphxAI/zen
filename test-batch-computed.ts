/**
 * Debug the batch computed updates test
 */

import { zen, computed, batch, subscribe } from './packages/zen/dist/index.js';

const a = zen(1);
const b = zen(2);
const sum = computed([a, b], (aVal, bVal) => aVal + bVal);

let callCount = 0;
const listener = (val: number, oldVal: number | undefined) => {
  callCount++;
  console.log(`[LISTENER #${callCount}] value changed: ${oldVal} -> ${val}`);
};

subscribe(sum, listener);

// Trigger initial computation and activate auto-tracking
console.log('Accessing sum.value for first time...');
const initial = sum.value;
console.log(`Initial value: ${initial}`);
console.log(`sum._dirty after access: ${(sum as any)._dirty}`);
console.log(`sum._sources.length: ${(sum as any)._sources.length}`);
console.log(`sum._sources: ${JSON.stringify((sum as any)._sources.map((s: any) => s._kind))}`);
console.log(`sum._unsubs: ${(sum as any)._unsubs ? `EXISTS (length: ${(sum as any)._unsubs.length})` : 'undefined'}`);
console.log(`sum._value: ${(sum as any)._value}`);

// Check if a and b have listeners
console.log(`a._listeners: ${a._listeners ? a._listeners.length : 'undefined'}`);
console.log(`b._listeners: ${b._listeners ? b._listeners.length : 'undefined'}`);
console.log('');

callCount = 0; // Reset

console.log('Running batch...');
batch(() => {
  console.log('  Setting a = 10');
  a.value = 10;
  console.log('  Setting b = 20');
  b.value = 20;
  console.log('  Exiting batch');
});

console.log(`\nTotal listener calls: ${callCount}`);
console.log(`Expected: 1`);
console.log(`sum.value after batch: ${sum.value}`);

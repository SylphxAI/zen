/**
 * Debug listener function type
 */

import { zen, computed, subscribe } from './packages/zen/dist/index.js';

const a = zen(1);
const b = zen(2);

const c = computed([a, b], (aVal, bVal) => aVal + bVal);

subscribe(c, (val) => {
  console.log(`Notified: ${val}`);
});

console.log('\nChecking a._listeners:');
console.log(`a._listeners.length: ${a._listeners?.length || 0}`);

if (a._listeners && a._listeners.length > 0) {
  const listener = a._listeners[0];
  console.log(`listener type: ${typeof listener}`);
  console.log(`listener: ${listener}`);
  console.log(`listener._computedZen: ${(listener as any)._computedZen}`);
  console.log(`listener keys: ${Object.keys(listener)}`);
  console.log(`listener own properties: ${Object.getOwnPropertyNames(listener)}`);

  // Check if it's been set on the function
  for (const key in listener) {
    console.log(`  ${key}: ${(listener as any)[key]}`);
  }
}

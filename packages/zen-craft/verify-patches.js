import { produceWithPatches } from '@sylphx/craft';

console.log('=== Craft Set Patches ===\n');

// Test 1: Simple Set operations
const base1 = { set: new Set([1, 2, 3]) };
const [next1, patches1] = produceWithPatches(base1, (draft) => {
  draft.set.delete(2);
  draft.set.add(4);
});

console.log('Test 1: Set.delete(2) + Set.add(4)');
console.log('Base:', Array.from(base1.set));
console.log('Next:', Array.from(next1.set));
console.log('Patches:', JSON.stringify(patches1, null, 2));

// Test 2: Set with objects
console.log('\n=== Test 2: Set with Objects ===\n');
const obj1 = { id: 1, name: 'a' };
const obj2 = { id: 2, name: 'b' };
const base2 = { set: new Set([obj1, obj2]) };
const [next2, patches2] = produceWithPatches(base2, (draft) => {
  draft.set.delete(obj1);
  draft.set.add({ id: 3, name: 'c' });
});

console.log('Base:', Array.from(base2.set));
console.log('Next:', Array.from(next2.set));
console.log('Patches:', JSON.stringify(patches2, null, 2));

// Test 3: RFC 6902 standard operations
console.log('\n=== RFC 6902 Standard Operations ===\n');
const base3 = { arr: [1, 2, 3], obj: { a: 1 } };
const [next3, patches3] = produceWithPatches(base3, (draft) => {
  draft.arr.splice(1, 1);  // Remove array element
  delete draft.obj.a;       // Remove object property
});

console.log('Array remove:', JSON.stringify(patches3[0], null, 2));
console.log('Object remove:', JSON.stringify(patches3[1], null, 2));

console.log('\n=== Analysis ===');
console.log('Set remove has value?', patches1[0].value !== undefined ? 'YES ✓' : 'NO');
console.log('Array remove has value?', patches3[0].value !== undefined ? 'YES' : 'NO ✓');

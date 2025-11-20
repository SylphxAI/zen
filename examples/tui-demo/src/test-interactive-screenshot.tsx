/**
 * Test interactive demo rendering by taking a screenshot
 */

import { render } from '@zen/tui';
import { createRoot } from '@zen/signal';
import { App } from './interactive-demo-app.tsx';

console.log('Creating app with owner context...');
const tree = createRoot(() => App());
console.log('Tree created');

console.log('\nRendering...');
const output = render(tree);

console.log('Output length:', output.length);
console.log('\n--- Rendered output ---');
console.log(output);
console.log('--- End ---');

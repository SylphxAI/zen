/**
 * Test simple render to debug white page issue
 */

import { Box, Text, renderToTerminal } from '@zen/tui';

console.log('Creating simple tree...');

const tree = (
  <Box style={{ padding: 1 }}>
    <Text color="cyan">Hello World!</Text>
    <Text>This is a test.</Text>
  </Box>
);

console.log('Tree created:', tree);

console.log('\nRendering...');
const output = renderToTerminal(tree);

console.log('Output:', output);
console.log('\n--- Rendered output ---');
console.log(output.content);
console.log('--- End ---');

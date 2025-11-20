/**
 * Demo: flexDirection: 'row' support
 *
 * Tests inline rendering of children within Text and Box components
 */

import { Box, Text, render } from '@zen/tui';

function App() {
  return (
    <Box style={{ width: 60, borderStyle: 'single', padding: 1 }}>
      <Text bold>Flexbox Row Layout Test</Text>

      <Text>
        <Text color="red">Red</Text>
        <Text color="green"> Green</Text>
        <Text color="blue"> Blue</Text>
      </Text>

      <Text>
        <Text dim>[10:00:00]</Text>
        <Text> </Text>
        <Text color="cyan" bold>
          INFO
        </Text>
        <Text> - Server started</Text>
      </Text>

      <Box style={{ flexDirection: 'row' }}>
        <Text>Left </Text>
        <Text>Middle </Text>
        <Text>Right</Text>
      </Box>
    </Box>
  );
}

const output = render(App());
console.log(output);

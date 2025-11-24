/** @jsxImportSource @zen/tui */
/**
 * Test onClick handler on Box component
 */
import { signal } from '@zen/signal';
import { Box, Text, renderToTerminalReactive } from '@zen/tui';

const $count = signal(0);
const $lastClick = signal('None');

function OnClickTest() {
  return (
    <Box style={{ flexDirection: 'column', padding: 1 }}>
      <Text style={{ bold: true }}>onClick Test - Click the boxes!</Text>
      <Text> </Text>

      {/* Clickable boxes */}
      <Box style={{ flexDirection: 'row', gap: 2 }}>
        <Box
          style={{ borderStyle: 'single', padding: 1, width: 15 }}
          onClick={() => {
            $count.value++;
            $lastClick.value = 'Box 1';
          }}
        >
          <Text style={{ color: 'cyan' }}>Box 1</Text>
        </Box>

        <Box
          style={{ borderStyle: 'single', padding: 1, width: 15 }}
          onClick={() => {
            $count.value++;
            $lastClick.value = 'Box 2';
          }}
        >
          <Text style={{ color: 'green' }}>Box 2</Text>
        </Box>

        <Box
          style={{ borderStyle: 'single', padding: 1, width: 15 }}
          onClick={() => {
            $count.value++;
            $lastClick.value = 'Box 3';
          }}
        >
          <Text style={{ color: 'yellow' }}>Box 3</Text>
        </Box>
      </Box>

      <Text> </Text>
      <Text>Click count: {() => $count.value}</Text>
      <Text>Last clicked: {() => $lastClick.value}</Text>
      <Text> </Text>
      <Text style={{ dim: true }}>Press q to quit</Text>
    </Box>
  );
}

await renderToTerminalReactive(() => <OnClickTest />, { fullscreen: true, mouse: true });

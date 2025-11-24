/** @jsxImportSource @zen/tui */
/**
 * Test absolute positioning
 */

import { signal } from '@zen/signal';
import { Box, Text, renderToTerminalReactive, useInput, useTerminalSize } from '@zen/tui';

// Position state
const $x = signal(5);
const $y = signal(5);
const $zIndex = signal(1);

function AbsoluteTest() {
  const { width, height } = useTerminalSize();

  useInput((input, key) => {
    if (key.leftArrow) $x.value = Math.max(0, $x.value - 1);
    if (key.rightArrow) $x.value = Math.min(width - 20, $x.value + 1);
    if (key.upArrow) $y.value = Math.max(0, $y.value - 1);
    if (key.downArrow) $y.value = Math.min(height - 5, $y.value + 1);
    if (input === 'z') $zIndex.value = ($zIndex.value % 3) + 1;
  });

  return (
    <Box style={{ width, height, flexDirection: 'column' }}>
      {/* Background content */}
      <Box style={{ padding: 1 }}>
        <Text style={{ color: 'gray' }}>
          Use arrow keys to move the box. Press 'z' to change zIndex.
        </Text>
      </Box>

      {/* Static boxes for zIndex testing */}
      <Box
        style={{
          position: 'absolute',
          left: 10,
          top: 8,
          width: 25,
          height: 5,
          borderStyle: 'single',
          borderColor: 'blue',
          zIndex: 1,
        }}
      >
        <Box style={{ padding: 1 }}>
          <Text style={{ color: 'blue' }}>Static Box (zIndex: 1)</Text>
        </Box>
      </Box>

      <Box
        style={{
          position: 'absolute',
          left: 20,
          top: 10,
          width: 25,
          height: 5,
          borderStyle: 'single',
          borderColor: 'green',
          zIndex: 2,
        }}
      >
        <Box style={{ padding: 1 }}>
          <Text style={{ color: 'green' }}>Static Box (zIndex: 2)</Text>
        </Box>
      </Box>

      {/* Movable box */}
      <Box
        style={{
          position: 'absolute',
          left: () => $x.value,
          top: () => $y.value,
          width: 30,
          height: 5,
          borderStyle: 'round',
          borderColor: 'cyan',
          zIndex: () => $zIndex.value,
          backgroundColor: 'black',
        }}
      >
        <Box style={{ padding: 1, flexDirection: 'column' }}>
          <Text style={{ color: 'cyan', bold: true }}>Movable Window</Text>
          <Text>Position: {() => `${$x.value}, ${$y.value}`}</Text>
          <Text>zIndex: {() => $zIndex.value}</Text>
        </Box>
      </Box>
    </Box>
  );
}

await renderToTerminalReactive(() => <AbsoluteTest />, { fullscreen: true });

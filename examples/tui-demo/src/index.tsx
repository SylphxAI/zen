/**
 * TUI Demo - Terminal UI Renderer
 *
 * Demonstrates TUI rendering with Box and Text components.
 * Platform abstraction layer enables runtime components
 * (For, Show, Switch) but they require additional work for TUI.
 */

import { renderToTerminal, signal } from '@zen/tui';
import { Box, Text } from '@zen/tui';

function App() {
  const count = signal(0);

  return (
    <Box
      style={{
        width: 60,
        height: 15,
        padding: 2,
        borderStyle: 'round',
        borderColor: 'cyan',
      }}
    >
      <Text style={{ bold: true, color: 'green' }}>🎯 Zen TUI Demo</Text>

      <Box>
        <Text>Counter: </Text>
        <Text style={{ bold: true, color: 'yellow' }}>{count}</Text>
      </Box>

      <Box>
        <Text style={{ underline: true }}>Feature Test:</Text>
      </Box>

      <Box>
        <Text style={{ color: 'blue' }}>• Box component ✓</Text>
      </Box>

      <Box>
        <Text style={{ color: 'blue' }}>• Text styling ✓</Text>
      </Box>

      <Box>
        <Text style={{ color: 'blue' }}>• Signal integration ✓</Text>
      </Box>

      <Box>
        <Text style={{ dim: true, italic: true }}>Platform: Terminal UI</Text>
      </Box>
    </Box>
  );
}

// Render to terminal
await renderToTerminal(<App />);

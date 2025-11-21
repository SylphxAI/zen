import { signal } from '@zen/signal';
import { renderToTerminalReactive, useInput } from '@zen/tui';
import { Box, FocusProvider, Text } from '@zen/tui';

const counter = signal(0);
const lastKey = signal('');

const ConsoleTest = () => {
  // Log on every key press
  useInput((input, _key) => {
    counter.value++;
    lastKey.value = input === ' ' ? 'space' : input;
  });

  return (
    <Box
      style={{
        flexDirection: 'column',
        gap: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        padding: 1,
      }}
    >
      <Text bold color="cyan">
        Console.log Test (Key Press)
      </Text>
      <Text>Press any key to trigger console.log above the app</Text>
      <Text dim>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

      <Text>
        Key count:{' '}
        <Text bold color="green">
          {counter}
        </Text>
      </Text>
      <Text>
        Last key:{' '}
        <Text bold color="yellow">
          {lastKey}
        </Text>
      </Text>

      <Text dim style={{ marginTop: 1 }}>
        Press Ctrl+C to exit
      </Text>
    </Box>
  );
};

await renderToTerminalReactive(() => (
  <FocusProvider>
    <ConsoleTest />
  </FocusProvider>
));

/** @jsxImportSource @zen/tui */
import { renderToTerminalReactive, FocusProvider, useFocusManager } from '@zen/tui';
import { Box, Text } from '@zen/tui';

console.log('=== Descriptor Pattern Test ===\n');

const TestChild = () => {
  console.log('[TestChild] Executing...');

  try {
    const manager = useFocusManager();
    console.log('[TestChild] ✅ SUCCESS! Found FocusManager');
    console.log('[TestChild] Manager keys:', Object.keys(manager));
    return <Text color="green">✓ Context propagation WORKS with descriptor pattern!</Text>;
  } catch (error: any) {
    console.log('[TestChild] ❌ ERROR:', error.message);
    return <Text color="red">✗ Context not found</Text>;
  }
};

const App = () => {
  console.log('[App] Creating FocusProvider with child');
  return (
    <FocusProvider>
      <Box flexDirection="column" padding={1}>
        <Text color="cyan" bold>Descriptor Pattern Test</Text>
        <Text>{''}</Text>
        <TestChild />
        <Text>{''}</Text>
        <Text dimColor>This uses standard JSX: &lt;Provider&gt;&lt;Child /&gt;&lt;/Provider&gt;</Text>
        <Text dimColor>No manual lazy children needed!</Text>
      </Box>
    </FocusProvider>
  );
};

const cleanup = await renderToTerminalReactive(() => <App />);

// Auto-exit after 1 second
setTimeout(() => {
  console.log('\n=== Test completed successfully! ===');
  cleanup();
  process.exit(0);
}, 1000);

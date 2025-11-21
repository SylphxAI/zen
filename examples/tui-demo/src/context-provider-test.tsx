/** @jsxImportSource @zen/tui */
import { renderToTerminalReactive, FocusProvider, useFocusManager } from '@zen/tui';
import { Box, Text } from '@zen/tui';
import { ContextProvider, createContext, useContext } from '@zen/runtime';

console.log('=== ContextProvider Helper Test ===\n');

// Create a test context
const TestContext = createContext<{ message: string } | null>(null);

const TestChild = () => {
  console.log('[TestChild] Executing...');

  try {
    const ctx = useContext(TestContext);
    if (!ctx) {
      console.log('[TestChild] ❌ ERROR: Context is null');
      return <Text color="red">✗ Context is null</Text>;
    }
    console.log('[TestChild] ✅ SUCCESS! Found context:', ctx.message);
    return <Text color="green">✓ Context works! Message: {ctx.message}</Text>;
  } catch (error: any) {
    console.log('[TestChild] ❌ ERROR:', error.message);
    return <Text color="red">✗ Error: {error.message}</Text>;
  }
};

const App = () => {
  console.log('[App] Creating ContextProvider');
  return (
    <ContextProvider context={TestContext} value={{ message: 'Hello from ContextProvider!' }}>
      <Box flexDirection="column" padding={1}>
        <Text color="cyan" bold>ContextProvider Helper Test</Text>
        <Text>{''}</Text>
        <TestChild />
        <Text>{''}</Text>
        <Text dimColor>Using ContextProvider helper - pure JSX!</Text>
        <Text dimColor>No manual getters needed</Text>
      </Box>
    </ContextProvider>
  );
};

const cleanup = await renderToTerminalReactive(() => <App />);

setTimeout(() => {
  console.log('\n=== Test completed! ===');
  cleanup();
  process.exit(0);
}, 1000);

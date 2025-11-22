/** @jsxImportSource @zen/tui */
import { FocusProvider, renderToTerminalReactive, useFocusManager } from '@zen/tui';
import { Box, Text } from '@zen/tui';

const TestChild = () => {
  try {
    const _manager = useFocusManager();
    return <Text color="green">✓ Context found!</Text>;
  } catch (_error) {
    return <Text color="red">✗ Context not found</Text>;
  }
};

const App = () => {
  return (
    <FocusProvider>
      {/* Manual lazy children - wrap in function */}
      {() => <TestChild />}
    </FocusProvider>
  );
};

const cleanup = await renderToTerminalReactive(() => <App />);

setTimeout(() => {
  cleanup();
  process.exit(0);
}, 1000);

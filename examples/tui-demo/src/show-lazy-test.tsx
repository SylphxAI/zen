/** @jsxImportSource @zen/tui */
import { renderToTerminalReactive } from '@zen/tui';
import { Box, Text } from '@zen/tui';
import { Show } from '@zen/runtime';
import { signal } from '@zen/runtime';

console.log('=== Show Lazy Execution Test ===\n');

let expensiveChildExecuted = false;

const ExpensiveChild = () => {
  console.log('[ExpensiveChild] 🔴 EXECUTED! (This should NOT happen when when=false)');
  expensiveChildExecuted = true;
  return <Text color="red">Expensive Child Rendered</Text>;
};

const CheapChild = () => {
  console.log('[CheapChild] ✅ EXECUTED (This should happen when when=true)');
  return <Text color="green">Cheap Child Rendered</Text>;
};

const App = () => {
  const condition = signal(false);

  console.log('\n=== Test 1: when=false ===');
  console.log('ExpensiveChild should NOT execute...\n');

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="cyan" bold>
        Show Lazy Execution Test
      </Text>
      <Text>{''}</Text>

      <Text>Test 1: when=false (ExpensiveChild should NOT execute)</Text>
      <Show when={() => condition.value}>
        <ExpensiveChild />
      </Show>

      <Text>{''}</Text>
      <Text>Test 2: when=true (CheapChild should execute)</Text>
      <Show when={() => true}>
        <CheapChild />
      </Show>

      <Text>{''}</Text>
      {expensiveChildExecuted ? (
        <Text color="red">❌ FAILED: ExpensiveChild executed when when=false!</Text>
      ) : (
        <Text color="green">✅ PASSED: ExpensiveChild did NOT execute!</Text>
      )}
    </Box>
  );
};

const cleanup = await renderToTerminalReactive(() => <App />);

setTimeout(() => {
  console.log('\n=== Test Result ===');
  if (expensiveChildExecuted) {
    console.log('❌ FAILED: ExpensiveChild should not execute when when=false');
  } else {
    console.log('✅ PASSED: Show correctly uses lazy evaluation!');
  }
  cleanup();
  process.exit(expensiveChildExecuted ? 1 : 0);
}, 1000);

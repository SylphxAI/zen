/**
 * Test children() helper for Context propagation
 *
 * This demonstrates the runtime-first approach using children() helper
 * without requiring the compiler.
 */

import { createContext, useContext } from '@zen/runtime';
import { renderToTerminal } from '@zen/tui';

// Create a theme context
const ThemeContext = createContext<{ color: string }>({ color: 'default' });

// Child component that uses context
function Child() {
  const theme = useContext(ThemeContext);

  return {
    type: 'box' as const,
    tagName: 'box',
    props: { borderStyle: 'single' },
    children: [`Theme color: ${theme.color}`],
  };
}

// App component
function App() {
  return {
    type: 'box' as const,
    tagName: 'box',
    props: {},
    children: [
      // Using ThemeContext.Provider
      ThemeContext.Provider({
        value: { color: 'red' },
        children: Child(),
      }),
    ],
  };
}

// Render
const _output = renderToTerminal(App);

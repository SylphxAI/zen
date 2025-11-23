/** @jsxImportSource @zen/tui */
import { Box, Text, Router, $router, renderToTerminalReactive } from '@zen/tui';

function Home() {
  console.log('Home component rendered');
  return (
    <Box style={{ padding: 2 }}>
      <Text bold color="cyan">Home Page</Text>
    </Box>
  );
}

function About() {
  console.log('About component rendered');
  return (
    <Box style={{ padding: 2 }}>
      <Text bold color="green">About Page</Text>
    </Box>
  );
}

function App() {
  console.log('App rendered');
  console.log('Router state:', $router.value);

  return (
    <Box style={{ borderStyle: 'single', padding: 1 }}>
      <Text>TUI Router Debug</Text>
      <Text>Current path: {() => $router.value.path}</Text>

      <Box style={{ marginTop: 1 }}>
        <Router
          routes={[
            { path: '/', component: () => {
              console.log('/ route component called');
              return <Home />;
            }},
            { path: '/about', component: () => {
              console.log('/about route component called');
              return <About />;
            }},
          ]}
          fallback={() => {
            console.log('Fallback route called');
            return <Text color="red">404 Not Found</Text>;
          }}
        />
      </Box>

      <Box style={{ marginTop: 1 }}>
        <Text dim>Press q to quit</Text>
      </Box>
    </Box>
  );
}

console.log('Starting app...');

renderToTerminalReactive(() => <App />, {
  fullscreen: true,
  onKeyPress: (key) => {
    if (key === 'q' || key === '\x03') {
      process.exit(0);
    }
  },
});

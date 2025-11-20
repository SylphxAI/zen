import { Button, FocusProvider, renderToTerminal } from '@zen/tui';

function App() {
  return (
    <FocusProvider>
      <Button id="test" label="Test Button" variant="primary" width={20} />
    </FocusProvider>
  );
}

renderToTerminal(() => App());

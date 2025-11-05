# @sylphx/zen-router-preact

Preact integration for @sylphx/zen-router. Use Zen router in Preact components with hooks.

## Installation

```bash
npm install @sylphx/zen-router-preact
# or
bun add @sylphx/zen-router-preact
```

## Usage

```tsx
import { useRouter } from '@sylphx/zen-router-preact';

function App() {
  const router = useRouter();

  return (
    <div>
      <p>Current path: {router.path}</p>
      <p>Page param: {router.params.page}</p>
    </div>
  );
}
```

## API

### `useRouter(): RouterState`

Returns the current router state, re-rendering the component when it changes.

**Returns:**
- `path`: Current URL path
- `search`: Parsed query parameters
- `params`: Route parameters

## License

MIT

# @sylphx/zen-router-react

React integration for @sylphx/zen-router. Use Zen router in React components with hooks.

## Installation

```bash
npm install @sylphx/zen-router-react
# or
bun add @sylphx/zen-router-react
```

## Usage

```tsx
import { useRouter } from '@sylphx/zen-router-react';

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

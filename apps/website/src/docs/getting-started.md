# Getting Started

Get up and running with Zen in minutes.

## Installation

Install Zen using your favorite package manager:

```bash
# npm
npm install @zen/zen

# bun
bun add @zen/zen

# pnpm
pnpm add @zen/zen
```

## Your First App

Create a simple counter application:

```typescript
import { render, signal } from '@zen/zen';

function Counter() {
  const count = signal(0);

  return (
    <div>
      <h1>Count: {count.value}</h1>
      <button onClick={() => count.value++}>
        Increment
      </button>
    </div>
  );
}

render(() => <Counter />, document.getElementById('app'));
```

## Setup with Vite

Configure Vite for JSX automatic runtime:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@zen/zen'
  }
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@zen/zen"
  }
}
```

That's it! You're ready to build reactive UIs with Zen.

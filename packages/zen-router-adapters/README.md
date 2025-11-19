# @zen/router-adapters

Universal router hooks for all frameworks - **one package, all frameworks**.

Eliminates code duplication across React, Preact, and Zen framework adapters.

## Installation

```bash
npm install @zen/router @zen/router-adapters
```

## Usage

### Auto-detect (Recommended)

Automatically detects React or Preact in your project:

```tsx
import { useRouter, useParams, useSearchParams, useNavigate } from '@zen/router-adapters';

function UserProfile() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>User ID: {params.id}</h1>
      <p>Current path: {router.path}</p>
      <button onClick={() => navigate('/home')}>Go Home</button>
    </div>
  );
}
```

### Explicit Framework

For better tree-shaking and explicit control:

#### React

```tsx
import { useRouter } from '@zen/router-adapters/react';
```

#### Preact

```tsx
import { useRouter } from '@zen/router-adapters/preact';
```

#### Zen Framework

```tsx
import { useRouter } from '@zen/router-adapters/zen';
```

## API

### `useRouter()`

Returns the full router state (path, params, search).

```tsx
const router = useRouter();
// { path: '/users/123', params: { id: '123' }, search: { tab: 'profile' } }
```

### `useParams()`

Returns only the route parameters.

```tsx
const params = useParams();
// { id: '123' }
```

### `useSearchParams()`

Returns only the query parameters.

```tsx
const search = useSearchParams();
// { tab: 'profile', page: '2' }
```

### `useNavigate()`

Returns the navigation function.

```tsx
const navigate = useNavigate();

navigate('/about');
navigate('/users/456');
```

## Advanced: Custom Adapter

Create your own adapter for other frameworks:

```typescript
import { createUseRouter } from '@zen/router-adapters/core';
import { useState, useEffect } from 'your-framework';

export const useRouter = createUseRouter({ useState, useEffect });
```

## Architecture

```
@zen/router-adapters/
├── index.ts           # Auto-detect entry
├── react.ts           # React adapter
├── preact.ts          # Preact adapter
├── zen.ts             # Zen framework adapter
└── core/
    └── create-hooks.ts  # Factory functions
```

All framework adapters share the same core logic, eliminating 95%+ code duplication.

## Migration from Old Packages

**Before:**
```tsx
import { useRouter } from '@zen/router-react';
import { useRouter } from '@zen/router-preact';
import { useRouter } from '@zen/router-zen';
```

**After:**
```tsx
// Auto-detect
import { useRouter } from '@zen/router-adapters';

// Or explicit
import { useRouter } from '@zen/router-adapters/react';
import { useRouter } from '@zen/router-adapters/preact';
import { useRouter } from '@zen/router-adapters/zen';
```

## License

MIT © [Sylphx](https://sylphx.com)

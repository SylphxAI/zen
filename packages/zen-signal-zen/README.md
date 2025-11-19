# @zen/signal-zen

Zen framework adapter for Zen Signal reactive primitives.

## Purpose

This package provides lifecycle-aware wrappers around `@zen/signal` primitives, automatically integrating with Zen's component lifecycle system.

## Architecture

```
@zen/signal (framework-agnostic core)
      ↓
@zen/signal-zen (Zen framework adapter)
      ↓
@zen/zen (re-exports signal-zen)
      ↓
User code
```

## Key Features

- **Automatic cleanup**: `effect()` auto-registers cleanup with owner system
- **Drop-in replacement**: Same API as `@zen/signal` but lifecycle-aware
- **Zero boilerplate**: No manual `onCleanup()` needed

## Usage

```tsx
import { effect } from '@zen/signal-zen';

function Component() {
  // Cleanup automatically registered when component unmounts
  effect(() => {
    console.log('Effect running');
    return () => console.log('Cleanup');
  });

  return <div>Component</div>;
}
```

## Comparison

**Before (manual cleanup)**:
```tsx
import { effect } from '@zen/signal';
import { onCleanup } from '@zen/zen';

const dispose = effect(() => {
  // effect body
  return () => { /* cleanup */ };
});
onCleanup(() => dispose());
```

**After (automatic cleanup)**:
```tsx
import { effect } from '@zen/signal-zen';

effect(() => {
  // effect body
  return () => { /* cleanup */ };
});
```

## License

MIT

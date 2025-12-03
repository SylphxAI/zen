<div align="center">

# 🧘 Rapid Ecosystem

> Ultra-fast reactive primitives (@rapid/signal) and fine-grained framework (@rapid/web)

[![npm](https://img.shields.io/npm/v/@rapid/signal)](https://www.npmjs.com/package/@rapid/signal)
[![downloads](https://img.shields.io/npm/dm/@rapid/signal)](https://www.npmjs.com/package/@rapid/signal)
[![stars](https://img.shields.io/github/stars/SylphxAI/rapid)](https://github.com/SylphxAI/rapid)
[![CI](https://github.com/SylphxAI/rapid/actions/workflows/ci.yml/badge.svg)](https://github.com/SylphxAI/rapid/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**2.49 KB** • **2.97x vs Solid** • **Auto-tracking** • **Zero config**

[Core Package](#-core-package) • [Framework Integrations](#-framework-integrations) • [Utilities](#-utilities) • [Quick Start](#-quick-start)

</div>

---

## 🚀 Overview

Rapid is a revolutionary reactive state management library that combines extreme minimalism with magical auto-tracking. Built for modern applications, Rapid provides the smallest bundle size without sacrificing performance or developer experience.

**The Problem:**
```
Traditional state libraries:
- Large bundle sizes ❌
- Manual dependency tracking ❌
- Verbose APIs ❌
- Poor performance ❌
```

**The Solution:**
```
Rapid:
- 2.49 KB gzipped ✅
- Automatic dependency tracking ✅
- Clean, unified API ✅
- Blazing fast performance ✅
```

**Result: Minimal footprint, maximum performance, zero configuration.**

---

## ⚡ Key Features

### Performance & Size

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Ultra-tiny** | Only **2.49 KB gzipped** (v3.8) | Minimal bundle impact |
| **Lightning fast** | **2.97x slower vs Solid.js** | Competitive performance |
| **Zero overhead** | Auto-tracking with minimal runtime cost | Optimal performance |

### Developer Experience

- **🪄 Auto-tracking** - Dependencies tracked automatically, no manual lists
- **🎯 Clean API** - Unified `.value` everywhere, no `get()`/`set()`
- **📦 Framework agnostic** - Use with React, Vue, Svelte, Solid, or vanilla JS
- **🔌 Extensible** - Modular utilities for persistence, routing, and more
- **💪 TypeScript-first** - Full type safety out of the box

---

## Packages

### 🎯 Core Packages

**[@rapid/signal](packages/rapid-signal)**
- Core reactive primitives (signal, computed, effect)
- Auto-tracking dependency system
- Ultra-tiny bundle (1.75 KB)
- Foundation for Rapid ecosystem

**[@rapid/web](packages/rapid-web)**
- Web renderer with fine-grained reactivity
- No virtual DOM - direct DOM updates
- Component render once, signals auto-update
- JSX with automatic signal unwrapping
- SSR and hydration support

**[@rapid/tui](packages/rapid-tui)**
- Terminal UI renderer for CLI applications
- Build beautiful terminal dashboards
- Same reactive primitives as web
- Box, Text components for layout

**[@rapid/native](packages/zen-native)** (Coming Soon)
- Native renderer for iOS/Android
- React Native-compatible components
- Platform-specific optimizations

```bash
# For web applications
npm install @rapid/web

# For terminal/CLI applications
npm install @rapid/tui

# For core reactivity only
npm install @rapid/signal
```

---

### 🎨 Framework Integrations

**[@rapid/signal-react](packages/rapid-signal-react)**
- React hooks integration
- Automatic re-renders
- Concurrent mode compatible

**[@rapid/signal-vue](packages/rapid-signal-vue)**
- Vue 3 composition API
- Seamless integration

**[@rapid/signal-svelte](packages/rapid-signal-svelte)**
- Svelte stores compatibility
- Reactive bindings

**[@rapid/signal-preact](packages/rapid-signal-preact)**
- Preact signals integration
- Lightweight alternative to React

**[@rapid/signal-solid](packages/rapid-signal-solid)**
- SolidJS primitives
- Fine-grained reactivity

```bash
# Install framework integration
npm install @rapid/signal-react
# or
npm install @rapid/signal-vue
# or
npm install @rapid/signal-svelte
```

---

### 🛠️ Utilities

**[@rapid/signal-patterns](packages/rapid-signal-patterns)** - **NEW v2.0** 🎉
- Useful patterns built on zen core APIs
- Store pattern (Zustand-style)
- Async state management
- Map pattern (key-level reactivity)
- DeepMap pattern (path-level reactivity)
- Only **936 B gzipped**

**[@rapid/signal-craft](packages/rapid-signal-craft)**
- Immutable state updates
- 1.4-35x faster than immer
- Type-safe mutations

**[@rapid/signal-persistent](packages/rapid-signal-persistent)**
- LocalStorage/SessionStorage persistence
- Automatic synchronization
- Debounced writes

**[@rapid/router](packages/zen-router)** & **[@rapid/router-react](packages/zen-router-react)** & **[@rapid/router-preact](packages/zen-router-preact)**
- Type-safe routing
- Nested routes support
- Framework-specific bindings

```bash
# Install utilities
npm install @rapid/signal-patterns  # NEW! Useful patterns
npm install @rapid/signal-craft
npm install @rapid/signal-persistent
npm install @rapid/router-react
```

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { signal, computed } from '@rapid/signal';

// Create reactive state
const count = signal(0);

// Auto-tracked computed value (no manual dependencies!)
const double = computed(() => count.value * 2);

// Update state
count.value++;
console.log(double.value); // 2
```

### With React

```tsx
import { useZen } from '@rapid/signal-react';
import { signal } from '@rapid/signal';

const counter = signal(0);

function Counter() {
  const count = useZen(counter);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => counter.value++}>Increment</button>
    </div>
  );
}
```

### With Patterns

```typescript
import { store, computedAsync, map } from '@rapid/signal-patterns';
import { signal } from '@rapid/signal';

// Zustand-style store pattern
const counter = store(() => {
  const count = signal(0);
  return {
    count,
    increase: () => count.value++,
    decrease: () => count.value--
  };
});

// Async state management
const user = computedAsync(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

// Key-level reactivity for objects
const form = map({
  name: '',
  email: '',
  age: 0
});
```

### With Persistence

```typescript
import { persistent } from '@rapid/signal-persistent';

// Automatically synced with localStorage
const settings = persistent('user-settings', {
  theme: 'dark',
  language: 'en'
});

// Changes are automatically persisted
settings.value.theme = 'light';
```

---

## 📊 Comparison

### Bundle Size

| Library | Size (gzipped) | Difference |
|---------|----------------|------------|
| Zustand | 1.2 KB | Baseline |
| **Rapid v3.8** | **2.49 KB** | +108% |
| Jotai | 3.0 KB | +150% |
| Valtio | 5.5 KB | +358% |
| Redux Toolkit | 12+ KB | +900% |

### Performance (vs Solid.js)

| Library | Performance | Auto-tracking | Computed |
|---------|------------|---------------|----------|
| Solid.js | 1x (baseline) | ✅ Yes | ✅ Yes |
| **Rapid v3.8** | **2.97x slower** | ✅ Yes | ✅ Yes |
| Zustand | Manual tracking | ❌ No | ❌ No |
| Valtio | Auto (Proxy) | ✅ Proxy | ❌ No |
| Redux | Manual tracking | ❌ No | ❌ No |

---

## 🏗️ Monorepo Structure

```
zen/
├── packages/
│   ├── zen-signal/             # @rapid/signal - Reactive primitives
│   ├── zen-web/                # @rapid/web - Web renderer
│   ├── zen-tui/                # @rapid/tui - Terminal UI renderer
│   ├── zen-native/             # @rapid/native - Native renderer (coming soon)
│   ├── zen-runtime/            # @rapid/runtime - Platform-agnostic components
│   ├── zen-signal-react/       # @rapid/signal-react - React integration
│   ├── zen-signal-vue/         # @rapid/signal-vue - Vue integration
│   ├── zen-signal-svelte/      # @rapid/signal-svelte - Svelte integration
│   ├── zen-signal-preact/      # @rapid/signal-preact - Preact integration
│   ├── zen-signal-solid/       # @rapid/signal-solid - SolidJS integration
│   ├── zen-signal-craft/       # @rapid/signal-craft - Immutable utilities
│   ├── zen-signal-patterns/    # @rapid/signal-patterns - Useful patterns
│   ├── zen-signal-persistent/  # @rapid/signal-persistent - Persistence
│   ├── zen-router/             # @rapid/router - Core routing
│   ├── zen-router-react/       # @rapid/router-react - React router
│   └── zen-router-preact/      # @rapid/router-preact - Preact router
├── docs/                       # Documentation site
├── package.json
└── README.md
```

---

## 💻 Development

### Setup

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun test

# Watch mode
bun test:watch

# Linting
bun run lint
bun run lint:fix
```

### Workspace Commands

```bash
# Build specific package
bun run build --filter @rapid/signal

# Test specific package
bun test --filter @rapid/signal

# Dev mode for all packages
bun run dev
```

---

## 📚 Documentation

### Core Concepts

- **State** - Reactive values that trigger updates
- **Computed** - Auto-tracked derived values
- **Effects** - Side effects that run on changes
- **Persistence** - Automatic storage synchronization

### Framework Integration

Each framework package provides idiomatic bindings:
- React: `useZen()` hook
- Vue: Composition API compatible
- Svelte: Store-compatible
- Solid: Signal-compatible

See individual package READMEs for detailed documentation.

---

## 🎯 Use Cases

### Application State

```typescript
import { state, computed } from '@rapid/signal';

const user = state({ name: 'Alice', age: 30 });
const isAdult = computed(() => user.value.age >= 18);
```

### Form Management

```typescript
const form = state({
  email: '',
  password: ''
});

const isValid = computed(() =>
  form.value.email.includes('@') &&
  form.value.password.length >= 8
);
```

### UI State

```typescript
const theme = persistent('theme', 'dark');
const sidebar = state({ open: false });
const modal = state({ show: false, content: null });
```

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript 5.9 |
| **Package Manager** | pnpm |
| **Monorepo** | pnpm workspaces + Turbo |
| **Testing** | Vitest |
| **Bundling** | tsup |
| **Linting** | Biome |
| **Documentation** | VitePress |

---

## 🗺️ Roadmap

### ✅ Completed

- [x] Core reactive state library
- [x] Auto-tracking computed values
- [x] React integration
- [x] Vue integration
- [x] Svelte integration
- [x] Preact integration
- [x] SolidJS integration
- [x] Immutable utilities (zen-craft)
- [x] Persistence utilities
- [x] Routing (zen-router)

### 🚀 Planned

- [ ] DevTools integration
- [ ] Time-travel debugging
- [ ] Performance profiler
- [ ] React Native support
- [ ] SSR optimizations
- [ ] More utility packages

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Open an issue** - Discuss changes before implementing
2. **Fork the repository**
3. **Create a feature branch** - `git checkout -b feature/my-feature`
4. **Follow code standards** - Run `pnpm lint`
5. **Write tests** - Maintain high coverage
6. **Submit a pull request**

### Development Workflow

```bash
# 1. Install dependencies
pnpm install

# 2. Make changes to packages

# 3. Build and test
pnpm build
pnpm test

# 4. Lint and format
pnpm lint:fix
pnpm format

# 5. Create changeset
pnpm changeset

# 6. Commit and push
git commit -m "feat: add new feature"
git push
```

---

## 📄 License

MIT © [Sylphx](https://sylphx.com)

---

## 🙏 Credits

Built with:
- [TypeScript](https://www.typescriptlang.org/) - Language
- [pnpm](https://pnpm.io/) - Package manager
- [Turbo](https://turbo.build/) - Monorepo tool
- [Vitest](https://vitest.dev/) - Testing framework
- [Biome](https://biomejs.dev/) - Linting & formatting

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=SylphxAI/rapid&type=Date)](https://star-history.com/#SylphxAI/rapid&Date)

## Powered by Sylphx

- [@sylphx/doctor](https://github.com/SylphxAI/doctor) - Monorepo health checker
- [@sylphx/bump](https://github.com/SylphxAI/bump) - Semantic versioning tool
- [@sylphx/biome-config](https://github.com/SylphxAI/biome-config) - Shared Biome configuration
- [@sylphx/tsconfig](https://github.com/SylphxAI/tsconfig) - Shared TypeScript configuration

---

<div align="center">
<sub>Built with ❤️ by <a href="https://github.com/SylphxAI">Sylphx</a></sub>
</div>

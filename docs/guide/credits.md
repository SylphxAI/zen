# Credits & Acknowledgments

Zen stands on the shoulders of giants. This page acknowledges the technologies, libraries, and people that made Zen possible.

---

## Technologies & Tools

### Runtime & Build

- **[Bun](https://bun.sh/)** - Ultra-fast JavaScript runtime and package manager
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[bunup](https://github.com/okikio/bunup)** - Simple, fast bundler for building packages
- **[Turborepo](https://turbo.build/)** - High-performance monorepo build system

### Testing & Quality

- **[Vitest](https://vitest.dev/)** - Blazing fast unit testing framework
- **[jsdom](https://github.com/jsdom/jsdom)** - DOM implementation for testing
- **[@testing-library](https://testing-library.com/)** - React & Preact testing utilities
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[size-limit](https://github.com/ai/size-limit)** - Bundle size tracking
- **[lefthook](https://github.com/evilmartians/lefthook)** - Fast Git hooks manager

### Versioning & Release

- **[Changesets](https://github.com/changesets/changesets)** - Version management and publishing workflow

### Documentation

- **[VitePress](https://vitepress.dev/)** - Beautiful Vue-powered static site generator
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform

---

## Inspiration & Prior Art

Zen was inspired by the best ideas from the reactive state management ecosystem:

### State Management Libraries

**[Zustand](https://github.com/pmndrs/zustand)** by Poimandres
- Minimal API design philosophy
- Simple store creation pattern
- Influence on Zen's ergonomic API

**[Jotai](https://github.com/pmndrs/jotai)** by Poimandres
- Atomic state management approach
- Bottom-up composition model
- Inspiration for fine-grained reactivity

**[@preact/signals](https://github.com/preactjs/signals)** by Preact Team
- Signal-based reactivity
- Lightweight and performant
- Framework adapter patterns

**[Solid.js](https://www.solidjs.com/)** by Ryan Carniato
- Fine-grained reactivity system
- Signal primitives (`createSignal`, `createMemo`)
- Explicit dependency tracking

**[Vue 3](https://vuejs.org/)** by Evan You
- Reactive `ref` and `computed` API
- Elegant reactivity system
- Composition API patterns

**[MobX](https://mobx.js.org/)** by Michel Weststrate
- Observable state management
- Auto-tracking reactivity patterns
- Deep reactivity concepts

**[Nanostores](https://github.com/nanostores/nanostores)** by Andrey Sitnik
- Minimal store size
- Framework-agnostic design
- Lightweight package philosophy

---

## Technical Influences

### Immutability

**[@sylphx/craft](https://www.npmjs.com/package/@sylphx/craft)**
- Powers `@sylphx/zen-craft` immutable updates
- Immer-like API with JSON Patch support
- Structural sharing and time-travel capabilities

**[Immer](https://immerjs.github.io/immer/)** by Michel Weststrate
- Original inspiration for immutable update patterns
- Mutable API for immutable updates concept
- Structural sharing implementation

### Reactivity Concepts

**[RxJS](https://rxjs.dev/)**
- Observable patterns
- Subscription management
- Reactive programming principles

**[Svelte Stores](https://svelte.dev/docs/svelte-store)**
- Simple store contract (`subscribe`)
- Minimal API surface
- Framework integration patterns

---

## Benchmarking & Comparison

To ensure Zen's performance claims are valid, we benchmark against leading state management libraries:

- **[Zustand](https://github.com/pmndrs/zustand)** - Simple store-based state management
- **[Jotai](https://github.com/pmndrs/jotai)** - Primitive and flexible atomic state
- **[@preact/signals](https://github.com/preactjs/signals)** - Fast signals with auto-tracking
- **[Nanostores](https://github.com/nanostores/nanostores)** - Tiny atomic state manager
- **[Valtio](https://github.com/pmndrs/valtio)** - Proxy-based state management
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - Official Redux toolset
- **[Effector](https://effector.dev/)** - Reactive state management
- **[Solid.js Store](https://www.solidjs.com/)** - Fine-grained reactive store

These libraries represent the best-in-class approaches to state management. Comparing against them helps us identify performance bottlenecks and ensure Zen delivers on its promises.

---

## Framework Integration

Zen provides first-class support for major frameworks:

- **[React](https://react.dev/)** - Most popular UI library
- **[Vue](https://vuejs.org/)** - Progressive framework
- **[Svelte](https://svelte.dev/)** - Compile-time framework
- **[Solid](https://www.solidjs.com/)** - Fine-grained reactivity
- **[Preact](https://preactjs.com/)** - Lightweight React alternative

---

## Special Thanks

### Community

- **Open Source Community** - For building amazing tools and sharing knowledge
- **State Management Pioneers** - For exploring and refining reactive patterns
- **Early Adopters** - For trying Zen and providing feedback

### Open Source Maintainers

Special recognition to the maintainers and contributors of the libraries that inspired Zen:

- **Poimandres team** - [Zustand](https://github.com/pmndrs/zustand), [Jotai](https://github.com/pmndrs/jotai), [Valtio](https://github.com/pmndrs/valtio)
- **[Jason Miller](https://github.com/developit)** & **Preact team** - [@preact/signals](https://github.com/preactjs/signals)
- **[Ryan Carniato](https://github.com/ryansolid)** - [Solid.js](https://github.com/solidjs/solid)
- **[Evan You](https://github.com/yyx990803)** - [Vue.js](https://github.com/vuejs/core)
- **[Michel Weststrate](https://github.com/mweststrate)** - [MobX](https://github.com/mobxjs/mobx), [Immer](https://github.com/immerjs/immer)
- **[Andrey Sitnik](https://github.com/ai)** - [Nanostores](https://github.com/nanostores/nanostores), size-limit
- **[Mark Erikson](https://github.com/markerikson)** - [Redux Toolkit](https://github.com/reduxjs/redux-toolkit)
- **[Dmitry Boldyriev](https://github.com/zerobias)** - [Effector](https://github.com/effector/effector)

### Tool Creators

Thank you to the creators of the tools that make Zen possible:

- **[Jarred Sumner](https://github.com/Jarred-Sumner)** - [Bun](https://github.com/oven-sh/bun) runtime
- **[Okiki Ojo](https://github.com/okikio)** - [bunup](https://github.com/okikio/bunup) bundler
- **[Anthony Fu](https://github.com/antfu)** - [Vitest](https://github.com/vitest-dev/vitest), countless dev tools
- **[Evan You](https://github.com/yyx990803)** - [VitePress](https://github.com/vuejs/vitepress)
- **[Nate Moore](https://github.com/natemoo-re)** & team - [Changesets](https://github.com/changesets/changesets)
- **[Emanuele Stoppa](https://github.com/emilioastarita)** & team - [Biome](https://github.com/biomejs/biome)
- **[Egor Gumenyuk](https://github.com/evilmartians)** & Evil Martians - [lefthook](https://github.com/evilmartians/lefthook)

Your work has shaped how we think about state management and build modern software.

---

## Philosophy

Zen combines the best ideas from these libraries while maintaining its own principles:

1. **Explicit over Implicit** - Clear dependencies, no magic
2. **Performance First** - Minimal overhead, maximum speed
3. **Framework Agnostic** - Works everywhere
4. **Type Safe** - Full TypeScript support
5. **Small Bundle** - ~2KB core, pay-as-you-go
6. **Familiar API** - Easy to learn, hard to misuse

---

## Contributing

Zen is open source and welcomes contributions!

- **GitHub**: [SylphxAI/zen](https://github.com/SylphxAI/zen)
- **Issues**: [Report bugs or request features](https://github.com/SylphxAI/zen/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/SylphxAI/zen/discussions)

---

## License

Zen is [MIT licensed](https://github.com/SylphxAI/zen/blob/main/LICENSE).

---

**Thank you to everyone who has contributed to the reactive programming ecosystem. Zen wouldn't exist without your pioneering work!** 🙏

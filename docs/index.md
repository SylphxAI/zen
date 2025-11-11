---
layout: home

hero:
  name: Zen
  text: Tiny, fast, and elegant
  tagline: Reactive state management for modern web apps
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/SylphxAI/zen

features:
  - icon: 🪶
    title: Ultra Lightweight
    details: Only 1.14 KB gzipped. 80% smaller than v2 - extreme minimalism for modern web.
  - icon: ⚡
    title: Blazing Fast
    details: 8x faster in real-world apps. Auto-tracking with zero overhead reactivity.
  - icon: 🪄
    title: Auto-tracking Magic
    details: Dependencies tracked automatically. No manual dependency arrays needed.
  - icon: 🔧
    title: Type Safe
    details: Written in TypeScript with excellent type inference out of the box.
  - icon: 🌳
    title: Tree Shakeable
    details: Import only what you need. Dead code elimination at its best.
  - icon: 🎨
    title: Framework Agnostic
    details: Works with React, Vue, Svelte, Solid, Preact and vanilla JS.
---

## Quick Start

Install Zen in your project:

::: code-group

```bash [npm]
npm install @sylphx/zen
```

```bash [pnpm]
pnpm add @sylphx/zen
```

```bash [yarn]
yarn add @sylphx/zen
```

```bash [bun]
bun add @sylphx/zen
```

:::

## Simple Example

```typescript
import { zen, computed } from '@sylphx/zen';

// Create reactive state
const count = zen(0);

// Create computed value - auto-tracks dependencies!
const double = computed(() => count.value * 2);

// Read values
console.log(count.value); // 0
console.log(double.value); // 0

// Update value
count.value++;

console.log(count.value); // 1
console.log(double.value); // 2
```

## Framework Integration

Zen works seamlessly with all major frameworks:

::: code-group

```tsx [React]
import { zen } from '@sylphx/zen';
import { useStore } from '@sylphx/zen-react';

const count = zen(0);

function Counter() {
  const value = useStore(count);
  return (
    <button onClick={() => count.value++}>
      Count: {value}
    </button>
  );
}
```

```vue [Vue]
<script setup>
import { zen } from '@sylphx/zen';
import { useStore } from '@sylphx/zen-vue';

const count = zen(0);
const value = useStore(count);
</script>

<template>
  <button @click="count.value++">
    Count: {{ value }}
  </button>
</template>
```

```svelte [Svelte]
<script>
import { zen } from '@sylphx/zen';
import { fromZen } from '@sylphx/zen-svelte';

const count = zen(0);
const store = fromZen(count);
</script>

<button on:click={() => count.value++}>
  Count: {$store}
</button>
```

:::

## Why Zen?

<div class="why-zen">

### **Simple**
No need to learn complex APIs. Just use `.value` to read and write.

### **Fast**
Auto-tracking with zero overhead. Benchmarks show 8x faster performance in real-world apps.

### **Tiny**
At 1.14 KB gzipped, Zen is the smallest reactive library with auto-tracking.

### **Complete**
Router, persistence, and immutable updates included. Everything you need, nothing you don't.

</div>

## Benchmarks

Real-world performance comparison:

| Library | Bundle Size | Counter App Performance | Auto-tracking |
|---------|-------------|------------------------|---------------|
| **Zen v3** | **1.14 KB** | **~800K ops/s** | ✅ |
| Preact Signals | 2.89 KB | ~100K ops/s | ✅ |
| Zen v2 | 5.7 KB | ~100K ops/s | ❌ |
| Zustand | 3.5 KB | N/A | ❌ |
| Jotai | 3.0 KB | N/A | ❌ |

**Zen v3 is 8x faster** in real-world applications with 60% smaller bundle size than alternatives.

<style>
.why-zen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.why-zen > div {
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.why-zen h3 {
  margin-top: 0;
  color: var(--vp-c-brand);
}
</style>

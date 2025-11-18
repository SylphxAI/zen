# Using Tailwind CSS with Zen

Tailwind CSS works perfectly with Zen! This guide shows you how to integrate Tailwind into your Zen project.

## Quick Start

### 1. Install Tailwind

```bash
bun add -D tailwindcss postcss autoprefixer
bunx tailwindcss init -p
```

### 2. Configure Tailwind

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. Create CSS File

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Import in Your App

```tsx
// src/main.tsx
import './index.css';
import { render } from '@zen/zen';
import { App } from './App';

render(() => <App />, document.getElementById('app')!);
```

### 5. Use Tailwind Classes

```tsx
import { signal } from '@zen/zen';

export function App() {
  const count = signal(0);

  return (
    <div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Count: {count.value}
        </h1>
        <div class="flex gap-4 justify-center">
          <button
            onClick={() => count.value--}
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Decrement
          </button>
          <button
            onClick={() => count.value++}
            class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            Increment
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Use `class` not `className`

Zen uses standard HTML attributes, so use `class` instead of React's `className`:

```tsx
// ✅ Correct
<div class="flex items-center gap-4">

// ❌ Wrong (React-style)
<div className="flex items-center gap-4">
```

### 2. Reactive Classes with Signals

You can use signals for dynamic classes:

```tsx
const isActive = signal(false);

<button class={isActive.value ? 'bg-blue-600' : 'bg-gray-600'}>
  Toggle
</button>
```

Or use a computed value for complex logic:

```tsx
const isActive = signal(false);
const isHovered = signal(false);

const buttonClass = computed(() => {
  const base = 'px-4 py-2 rounded transition';
  if (isActive.value) return `${base} bg-blue-600 text-white`;
  if (isHovered.value) return `${base} bg-gray-200`;
  return `${base} bg-white`;
});

<button
  class={buttonClass.value}
  onMouseEnter={() => isHovered.value = true}
  onMouseLeave={() => isHovered.value = false}
>
  Button
</button>
```

### 3. Custom Utility with @apply

Create reusable component styles:

```css
/* src/index.css */
@layer components {
  .btn {
    @apply px-6 py-3 rounded-lg font-semibold transition;
  }

  .btn-primary {
    @apply btn bg-blue-600 hover:bg-blue-700 text-white;
  }

  .btn-secondary {
    @apply btn bg-gray-600 hover:bg-gray-700 text-white;
  }
}
```

Then use in your components:

```tsx
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
```

### 4. Dark Mode

Enable dark mode in `tailwind.config.js`:

```js
export default {
  darkMode: 'class', // or 'media'
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // ...
}
```

Use in components:

```tsx
const darkMode = signal(false);

<div class={darkMode.value ? 'dark' : ''}>
  <div class="bg-white dark:bg-gray-900 text-black dark:text-white">
    <button
      onClick={() => darkMode.value = !darkMode.value}
      class="px-4 py-2 bg-gray-200 dark:bg-gray-700"
    >
      Toggle Dark Mode
    </button>
  </div>
</div>
```

## Complete Example: Todo App with Tailwind

```tsx
import { signal, computed, For, Show } from '@zen/zen';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export function TodoApp() {
  const todos = signal<Todo[]>([]);
  const newTodo = signal('');
  const filter = signal<'all' | 'active' | 'completed'>('all');

  const filteredTodos = computed(() => {
    const f = filter.value;
    const t = todos.value;
    if (f === 'active') return t.filter(t => !t.done);
    if (f === 'completed') return t.filter(t => t.done);
    return t;
  });

  const addTodo = () => {
    if (newTodo.value.trim()) {
      todos.value = [
        ...todos.value,
        { id: Date.now(), text: newTodo.value, done: false }
      ];
      newTodo.value = '';
    }
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(t => t.id !== id);
  };

  return (
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Todo App
        </h1>

        {/* Input */}
        <div class="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo.value}
            onInput={(e) => newTodo.value = (e.target as HTMLInputElement).value}
            onKeyPress={(e) => (e as KeyboardEvent).key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={addTodo}
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Add
          </button>
        </div>

        {/* Filters */}
        <div class="flex gap-2 mb-6">
          <button
            onClick={() => filter.value = 'all'}
            class={`px-4 py-2 rounded-lg font-medium transition ${
              filter.value === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => filter.value = 'active'}
            class={`px-4 py-2 rounded-lg font-medium transition ${
              filter.value === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => filter.value = 'completed'}
            class={`px-4 py-2 rounded-lg font-medium transition ${
              filter.value === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Todo List */}
        <div class="space-y-2">
          <For each={filteredTodos.value}>
            {(todo) => (
              <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                  class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span class={`flex-1 ${todo.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  class="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </For>
        </div>

        <Show when={filteredTodos.value.length === 0}>
          <div class="text-center py-12 text-gray-500 dark:text-gray-400">
            No todos in this filter
          </div>
        </Show>
      </div>
    </div>
  );
}
```

## TypeScript Support

Tailwind CSS IntelliSense works out of the box with VS Code. Install the extension:

```
ext install bradlc.vscode-tailwindcss
```

For better type safety with class names, consider using:

```bash
bun add -D tailwind-merge clsx
```

```tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...classes: (string | undefined | null | false)[]) =>
  twMerge(clsx(classes));

// Usage
<button class={cn(
  'px-4 py-2 rounded',
  isActive.value && 'bg-blue-600',
  isDisabled.value && 'opacity-50 cursor-not-allowed'
)}>
  Button
</button>
```

## Production Build

Tailwind automatically purges unused styles in production:

```bash
bun run build
```

The final CSS will only include the classes you actually use!

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/) - Unstyled, accessible components

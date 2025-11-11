# Migrating from Zustand to Zen

This guide helps you migrate from Zustand to Zen. Both are excellent state management libraries, but they have different philosophies and patterns.

## Core Philosophy Difference

### Zustand: Store-Based (Redux-like)

Zustand creates a **store** that encapsulates state and actions:

```typescript
// Zustand - Store with enclosed state
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));

// Usage in component
function Counter() {
  const count = useStore(state => state.count);
  const increment = useStore(state => state.increment);

  return <button onClick={increment}>{count}</button>;
}
```

**Characteristics:**
- State is **inside** the store
- Actions are **inside** the store
- Use selectors **inside** components
- Similar to Redux but simpler

### Zen: Signal-Based (Fine-grained Reactivity)

Zen creates **reactive primitives** (signals) that exist independently:

```typescript
// Zen - Pure reactive state (like signals)
const count = zen(0);

// Actions are just functions
function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}

// Usage in component
function Counter() {
  const value = useStore(count);

  return <button onClick={increment}>{value}</button>;
}
```

**Characteristics:**
- State is a **reactive primitive** (signal)
- Actions are **regular functions**
- State and actions are **separate**
- Similar to Solid.js signals or Vue refs

---

## Mental Model Shift

### Zustand: "Everything in the Store"

```typescript
// All state and logic in one place
const useStore = create((set, get) => ({
  // State
  todos: [],
  filter: 'all',

  // Computed
  get filteredTodos() {
    const { todos, filter } = get();
    return filter === 'all'
      ? todos
      : todos.filter(t => t.completed === (filter === 'completed'));
  },

  // Actions
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, completed: false }]
  })),

  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    )
  })),

  setFilter: (filter) => set({ filter })
}));
```

### Zen: "Signals + Functions"

```typescript
// Separate reactive primitives
const todos = zen([]);
const filter = zen('all');

// Computed as derived signals
const filteredTodos = computed([todos, filter], (list, f) => {
  return f === 'all'
    ? list
    : list.filter(t => t.completed === (f === 'completed'));
});

// Actions as regular functions
function addTodo(text) {
  todos.value = [...todos.value, {
    id: Date.now(),
    text,
    completed: false
  }];
}

function toggleTodo(id) {
  todos.value = todos.value.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
}

function setFilter(f) {
  filter.value = f;
}
```

---

## Pattern Conversions

### 1. Basic Store

#### Zustand

```typescript
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}));

// Component
function Counter() {
  const count = useStore(state => state.count);
  const increment = useStore(state => state.increment);

  return <button onClick={increment}>{count}</button>;
}
```

#### Zen

```typescript
const count = zen(0);

function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}

function reset() {
  count.value = 0;
}

// Component
function Counter() {
  const value = useStore(count);

  return <button onClick={increment}>{value}</button>;
}
```

---

### 2. Selectors

#### Zustand - Inline Selectors

```typescript
const useStore = create((set) => ({
  user: { name: 'John', email: 'john@example.com', age: 30 }
}));

// Component
function UserProfile() {
  // Selector inline in component
  const userName = useStore(state => state.user.name);
  const userEmail = useStore(state => state.user.email);

  return <div>{userName} - {userEmail}</div>;
}
```

#### Zen - External Selectors (Reusable)

```typescript
const user = zen({ name: 'John', email: 'john@example.com', age: 30 });

// Create selectors outside components (reusable!)
const userName = select(user, u => u.name);
const userEmail = select(user, u => u.email);

// Component
function UserProfile() {
  const name = useStore(userName);
  const email = useStore(userEmail);

  return <div>{name} - {email}</div>;
}
```

**Key Difference:**
- Zustand: Selectors are **per-component** (recreated each time)
- Zen: Selectors are **shared** (created once, reused everywhere)

---

### 3. Computed Values

#### Zustand - Getters

```typescript
const useStore = create((set, get) => ({
  price: 100,
  quantity: 2,
  taxRate: 0.1,

  get total() {
    const { price, quantity, taxRate } = get();
    return price * quantity * (1 + taxRate);
  }
}));

// Component
function Checkout() {
  const total = useStore(state => state.total);
  return <div>Total: ${total}</div>;
}
```

#### Zen - Computed Signals

```typescript
const price = zen(100);
const quantity = zen(2);
const taxRate = zen(0.1);

// Computed as reactive signal
const total = computed([price, quantity, taxRate], (p, q, t) => {
  return p * q * (1 + t);
});

// Component
function Checkout() {
  const value = useStore(total);
  return <div>Total: ${value}</div>;
}
```

**Key Difference:**
- Zustand: Getters run on **every access** (no caching)
- Zen: Computed values are **cached** until dependencies change

---

### 4. Async Actions

#### Zustand

```typescript
const useStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      set({ user, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  }
}));

// Component
function UserProfile({ userId }) {
  const { user, loading, error, fetchUser } = useStore();

  useEffect(() => {
    fetchUser(userId);
  }, [userId, fetchUser]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{user?.name}</div>;
}
```

#### Zen - Reactive Async (Recommended)

```typescript
const userId = zen(1);

// Automatically refetches when userId changes!
const user = computedAsync([userId], async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

// Component
function UserProfile() {
  const { loading, data, error } = useStore(user);

  if (loading && !data) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data?.name}</div>;
}

// Change userId to trigger refetch
function changeUser(newId) {
  userId.value = newId; // ✅ Automatically refetches!
}
```

**Key Difference:**
- Zustand: Manual async handling with useEffect
- Zen: **Automatic reactivity** with `computedAsync`

---

### 5. Middleware (Persist, Immer, DevTools)

#### Zustand - Middleware Pattern

```typescript
import { persist, devtools } from 'zustand/middleware';
import produce from 'immer';

const useStore = create(
  devtools(
    persist(
      (set) => ({
        todos: [],
        addTodo: (text) => set(
          produce((state) => {
            state.todos.push({ id: Date.now(), text });
          })
        )
      }),
      { name: 'todo-storage' }
    )
  )
);
```

#### Zen - Composable Utilities

```typescript
import { zen, computed } from '@sylphx/zen';
import { persistent } from '@sylphx/zen-persistent';
import { craftZen } from '@sylphx/zen-craft';

// Persistence
const todos = persistent(
  zen([]),
  { key: 'todo-storage', storage: localStorage }
);

// Immer-style updates with Craft
function addTodo(text) {
  craftZen(todos, (draft) => {
    draft.push({ id: Date.now(), text });
  });
}

// DevTools (coming soon)
// Or use browser extensions that support signals
```

**Available Zen Packages:**
- `@sylphx/zen-persistent` - localStorage/sessionStorage sync
- `@sylphx/zen-craft` - Immer-style immutable updates
- `@sylphx/zen-router` - Routing (similar to wouter)

---

### 6. Multiple Stores vs Multiple Signals

#### Zustand - Multiple Stores

```typescript
// Store 1
const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));

// Store 2
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  }))
}));

// Component uses multiple stores
function App() {
  const user = useUserStore(state => state.user);
  const items = useCartStore(state => state.items);

  return <div>{user?.name} has {items.length} items</div>;
}
```

#### Zen - Multiple Signals (Natural)

```typescript
// Just create signals
const user = zen(null);
const cartItems = zen([]);

// Functions
function setUser(u) {
  user.value = u;
}

function addItem(item) {
  cartItems.value = [...cartItems.value, item];
}

// Component uses multiple signals
function App() {
  const currentUser = useStore(user);
  const items = useStore(cartItems);

  return <div>{currentUser?.name} has {items.length} items</div>;
}
```

**Key Insight:**
- Zustand: Need to decide "one store or multiple stores?"
- Zen: Just create signals as needed (no store concept)

---

## Advanced Patterns

### Zustand `useShallow` → Zen Select

#### Zustand

```typescript
import { useShallow } from 'zustand/react/shallow';

const useStore = create((set) => ({
  user: { name: 'John', age: 30 },
  settings: { theme: 'dark' }
}));

function Component() {
  // Prevent re-render when other fields change
  const { name, age } = useStore(
    useShallow(state => ({
      name: state.user.name,
      age: state.user.age
    }))
  );
}
```

#### Zen

```typescript
const state = zen({
  user: { name: 'John', age: 30 },
  settings: { theme: 'dark' }
});

// Create selectors with custom equality
const userName = select(state, s => s.user.name);
const userAge = select(state, s => s.user.age);

function Component() {
  const name = useStore(userName);
  const age = useStore(userAge);
  // Only re-renders when name or age changes
}
```

---

### Zustand Slices → Zen Modules

#### Zustand - Slices Pattern

```typescript
const createUserSlice = (set) => ({
  user: null,
  setUser: (user) => set({ user })
});

const createCartSlice = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  }))
});

const useStore = create((set) => ({
  ...createUserSlice(set),
  ...createCartSlice(set)
}));
```

#### Zen - Module Pattern

```typescript
// user.ts
export const user = zen(null);
export function setUser(u) {
  user.value = u;
}

// cart.ts
export const cartItems = zen([]);
export function addItem(item) {
  cartItems.value = [...cartItems.value, item];
}

// Use anywhere
import { user, setUser } from './user';
import { cartItems, addItem } from './cart';
```

---

## Performance Comparison

### Render Optimization

#### Zustand - Selector Granularity

```typescript
// ❌ Over-subscribing (re-renders on any state change)
const { count, user, settings } = useStore();

// ✅ Granular selectors (only re-renders when count changes)
const count = useStore(state => state.count);
```

#### Zen - Automatic Granularity

```typescript
// ✅ Automatically granular
const count = zen(0);
const user = zen(null);

// Only re-renders when count changes
const value = useStore(count);
```

**Result:** Zen has finer-grained reactivity by default.

---

### Bundle Size

| Library | Size (gzipped) | Notes |
|---------|----------------|-------|
| Zustand | ~1.2 KB | Core only |
| Zustand + middleware | ~3-5 KB | With persist, immer |
| **Zen Core** | **1.14 KB** | Includes computed, async, auto-tracking |
| Zen + React | +0.3 KB | Framework integration |
| Zen + Ecosystem | +3-6 KB | Router, persistence, craft |

**Total comparison:**
- Zustand (full): ~5 KB
- Zen (full): ~2 KB (core + React)
- **Zen is smaller** with auto-tracking and more features

---

## Migration Checklist

### Step 1: Install Zen

```bash
npm install @sylphx/zen @sylphx/zen-react
```

### Step 2: Convert State

```typescript
// Before (Zustand)
const useStore = create((set) => ({
  count: 0
}));

// After (Zen)
import { zen } from '@sylphx/zen';
const count = zen(0);
```

### Step 3: Convert Actions

```typescript
// Before (Zustand)
const useStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}));

// After (Zen)
const count = zen(0);
function increment() {
  count.value++;
}
```

### Step 4: Update Components

```typescript
// Before (Zustand)
function Counter() {
  const count = useStore(state => state.count);
  const increment = useStore(state => state.increment);
  return <button onClick={increment}>{count}</button>;
}

// After (Zen)
import { useStore } from '@sylphx/zen-react';

function Counter() {
  const value = useStore(count);
  return <button onClick={increment}>{value}</button>;
}
```

### Step 5: Convert Computed/Selectors

```typescript
// Before (Zustand)
const useStore = create((set, get) => ({
  price: 100,
  quantity: 2,
  get total() {
    const { price, quantity } = get();
    return price * quantity;
  }
}));

// After (Zen)
const price = zen(100);
const quantity = zen(2);
const total = computed([price, quantity], (p, q) => p * q);
```

### Step 6: Handle Async (If Needed)

```typescript
// Before (Zustand)
const useStore = create((set) => ({
  data: null,
  loading: false,
  fetchData: async () => {
    set({ loading: true });
    const data = await fetch('/api/data').then(r => r.json());
    set({ data, loading: false });
  }
}));

// After (Zen)
const data = computedAsync([], async () => {
  return fetch('/api/data').then(r => r.json());
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Mutating State Directly

```typescript
// ❌ Wrong (Zustand habits)
const todos = zen([]);
todos.value.push(newTodo); // ❌ Mutation!

// ✅ Correct
todos.value = [...todos.value, newTodo];

// Or use Craft for Immer-style updates
import { craftZen } from '@sylphx/zen-craft';
craftZen(todos, draft => {
  draft.push(newTodo); // ✅ Safe mutation on draft
});
```

### ❌ Pitfall 2: Over-using `useStore()`

```typescript
// ❌ Not optimal (too many useStore calls)
function Component() {
  const name = useStore(select(user, u => u.name));
  const email = useStore(select(user, u => u.email));
  const age = useStore(select(user, u => u.age));
}

// ✅ Better (create selectors once)
const userName = select(user, u => u.name);
const userEmail = select(user, u => u.email);
const userAge = select(user, u => u.age);

function Component() {
  const name = useStore(userName);
  const email = useStore(userEmail);
  const age = useStore(userAge);
}
```

### ❌ Pitfall 3: Missing `.value`

```typescript
const count = zen(0);

// ❌ Wrong
if (count > 5) { } // Comparing object

// ✅ Correct
if (count.value > 5) { } // Comparing value
```

---

## When to Use Zustand vs Zen

### Use Zustand if:
- ✅ You prefer Redux-like patterns
- ✅ You want everything in one store
- ✅ You need a battle-tested library (Zustand is more mature)
- ✅ Bundle size is critical (~1KB vs ~6KB)

### Use Zen if:
- ✅ You prefer signals/reactive primitives
- ✅ You want fine-grained reactivity with auto-tracking
- ✅ You need computed async values
- ✅ You like Vue/Solid.js mental model
- ✅ You want maximum performance (8x faster real-world apps)

---

## Summary

| Aspect | Zustand | Zen |
|--------|---------|-----|
| **Philosophy** | Store-based (Redux-like) | Signal-based (Reactive) |
| **State** | Inside store | Independent signals |
| **Actions** | Methods in store | Regular functions |
| **Selectors** | Inline in components | Reusable computed/select |
| **Computed** | Getters (no cache) | Cached computed values |
| **Async** | Manual with useEffect | Reactive computedAsync |
| **Bundle Size** | ~1.2 KB | ~1.14 KB |
| **Performance** | Fast | 8x faster real-world |
| **Granularity** | Selector-based | Automatic fine-grained |

---

## Next Steps

- [Core Concepts](/guide/core-concepts) - Understand Zen's reactivity model
- [React Integration](/guide/react) - Learn useStore patterns
- [Computed Values](/guide/computed) - Master derived state
- [Async Operations](/guide/async) - Handle async with computedAsync

---

## Need Help?

- [GitHub Discussions](https://github.com/SylphxAI/zen/discussions)
- [Discord Community](https://discord.gg/zen) (coming soon)
- [Examples](/examples/counter) - See real-world patterns

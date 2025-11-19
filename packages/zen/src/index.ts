/**
 * ZenJS - Ultra-fast, ultra-lightweight reactive framework
 *
 * Beyond SolidJS in performance and simplicity.
 * Powered by @zen/signal reactive core.
 */

// Import JSX types (global augmentation)
import './jsx-types.js';

// Re-export everything from @zen/signal (includes signals + lifecycle)
export {
  signal,
  computed,
  effect,
  rawEffect,
  batch,
  untrack,
  peek,
  subscribe,
  onMount,
  onCleanup,
  createRoot,
  disposeNode,
  getOwner,
} from '@zen/signal';
export type { Signal, Computed, Owner } from '@zen/signal';

// Components
export { For } from './components/For.js';
export { Show } from './components/Show.js';
export { Switch, Match } from './components/Switch.js';
export { Portal } from './components/Portal.js';
export { ErrorBoundary } from './components/ErrorBoundary.js';
export { Suspense } from './components/Suspense.js';
export { Dynamic } from './components/Dynamic.js';

// Context API
export { createContext, useContext } from './components/Context.js';
export type { Context } from './components/Context.js';

// JSX
export { render, Fragment } from './jsx-runtime.js';

// Lifecycle already exported from @zen/signal above

// Utilities
export { lazy } from './lazy.js';

// Reactive utilities
export { resolve, isSignal } from './reactive-utils.js';
export type { Reactive, MaybeReactive } from './reactive-utils.js';
export { mergeProps, splitProps } from './utils/props.js';
export { selector } from './utils/selector.js';
export { runWithOwner } from './utils/runWithOwner.js';

// Server utilities
export { isServer, createUniqueId, setServerIdPrefix, resetIdCounter } from './server-utils.js';

// Types already exported from @zen/signal above

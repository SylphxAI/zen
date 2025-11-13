// Main entry point for the functional zen state management library.
// Minimal core - only essential features

// Core Types
export type { Listener, Unsubscribe, AnyZen, ZenValue } from './types';
import type { Zen as _Zen } from './zen';
export type Zen<T = unknown> = _Zen<T>;

// Other Types - From optimized version
import type { AnyZen, ZenValue } from './zen-optimized';
export type { ReadonlyZen, ComputedZen } from './computed';

// Core Factories - ULTRA OPTIMIZED
import {
  batch as _batch,
  computed as _computed,
  effect as _effect,
  subscribe as _subscribe,
  zen as _zen,
} from './zen-optimized';
export const zen: typeof _zen = _zen;
export { computed } from './computed'; // Use original computed for compatibility
export { effect } from './effect'; // Use original effect for compatibility

// Core Functions - ULTRA OPTIMIZED
export const subscribe: typeof _subscribe = _subscribe;
export const batch: typeof _batch = _batch;

// Other Functions - Keep for compatibility
export { batchedUpdate } from './batchedUpdate';
export { batched } from './batched';

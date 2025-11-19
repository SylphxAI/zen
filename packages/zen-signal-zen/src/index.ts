/**
 * @zen/signal-zen
 *
 * Zen framework adapter for Zen Signal
 * Provides lifecycle-aware wrappers for reactive primitives
 */

import {
  signal as rawSignal,
  computed as rawComputed,
  effect as rawEffect,
  batch,
  untrack,
  peek,
  subscribe,
} from '@zen/signal';
import type { Signal, Computed } from '@zen/signal';
import { getOwner, onCleanup } from '@zen/zen';

// ============================================================================
// LIFECYCLE-AWARE EFFECT
// ============================================================================

/**
 * Lifecycle-aware effect that automatically registers cleanup with owner system.
 *
 * When used inside a Zen component, cleanup is automatic.
 * When used outside components, behaves like raw effect.
 *
 * @example
 * ```tsx
 * function Component() {
 *   // Automatic cleanup when component unmounts - no manual onCleanup needed!
 *   effect(() => {
 *     console.log('Effect running');
 *     return () => console.log('Cleanup automatically registered');
 *   });
 * }
 * ```
 */
export function effect(
  callback: () => undefined | (() => void)
): () => void {
  const dispose = rawEffect(callback);

  // If we have an owner context, register cleanup automatically
  const owner = getOwner();
  if (owner) {
    onCleanup(dispose);
  }

  return dispose;
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export primitives unchanged (they don't need lifecycle awareness)
export { rawSignal as signal, rawComputed as computed };
export { batch, untrack, peek, subscribe };

// Re-export types
export type { Signal, Computed };

// Export raw effect for advanced users who want manual control
export { rawEffect };

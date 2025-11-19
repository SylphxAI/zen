/**
 * @zen/signal-extensions
 *
 * Unified package for all Zen Signal extensions:
 * - patterns (store, async, map, deepMap)
 * - persistent (localStorage/sessionStorage sync)
 * - craft (immutable updates with JSON Patches)
 *
 * @example
 * ```typescript
 * // Import from specific modules
 * import { store, map } from '@zen/signal-extensions/patterns';
 * import { persistentAtom } from '@zen/signal-extensions/persistent';
 * import { produce } from '@zen/signal-extensions/craft';
 * ```
 */

// Re-export all sub-modules
export * from '../patterns';
export * from '../persistent';
export * from '../craft';

/**
 * computedAsync: Computed values derived from zenAsync
 * 
 * Simple wrapper around zenAsync that creates computed async values.
 */

import type { ZenAsync } from './types';
import { zenAsync, type ZenAsyncOptions } from './zenAsync';

/**
 * Create a computed async value (derived from zenAsync)
 * 
 * This is a simpler API for creating async computed values
 * without needing to provide arguments.
 * 
 * @param asyncFn The async function to execute
 * @param options Configuration options
 * @returns ZenAsync instance
 * 
 * @example
 * ```typescript
 * const $currentUser = computedAsync(
 *   async () => fetchCurrentUser(),
 *   {
 *     keepAlive: true,
 *     staleTime: 5000,
 *   }
 * );
 * 
 * // Subscribe to get updates
 * subscribeToZenAsync($currentUser, [], (state) => {
 *   if (state.data) console.log('User:', state.data);
 * });
 * ```
 */
export function computedAsync<T>(
  asyncFn: () => Promise<T>,
  options?: Omit<ZenAsyncOptions<[]>, 'cacheKey'>,
): ZenAsync<T, []> {
  return zenAsync(asyncFn, options);
}

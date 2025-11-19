/**
 * Zen framework adapter for Zen Router
 *
 * No subscription needed - Zen framework auto-tracks signal access
 *
 * @example
 * ```tsx
 * import { useRouter, useParams } from '@zen/router-adapters/zen';
 *
 * function UserProfile() {
 *   const params = useParams();
 *   return <div>User ID: {params.id}</div>;
 * }
 * ```
 */

import { $router, open } from '@zen/router';
import type { Params, RouterState, Search } from '@zen/router';

/**
 * Returns the full router state (reactive in Zen framework)
 */
export function useRouter(): RouterState {
  return $router.value;
}

/**
 * Returns the current route parameters (reactive)
 */
export function useParams(): Params {
  return $router.value.params;
}

/**
 * Returns the current search/query parameters (reactive)
 */
export function useSearchParams(): Search {
  return $router.value.search;
}

/**
 * Returns a navigation function
 */
export function useNavigate(): typeof open {
  return open;
}

// Re-export types
export type { RouterState, Params, Search } from '@zen/router';

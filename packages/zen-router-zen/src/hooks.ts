/**
 * Router hooks for Zen framework
 */

import { $router, open } from '@zen/router';
import type { Params, RouterState, Search } from '@zen/router';

/**
 * Returns the current route parameters
 *
 * @example
 * ```tsx
 * // Route: /users/:id
 * function UserProfile() {
 *   const params = useParams();
 *   return <div>User ID: {params.id}</div>;
 * }
 * ```
 */
export function useParams(): Params {
  return $router.value.params;
}

/**
 * Returns the current search/query parameters
 *
 * @example
 * ```tsx
 * // URL: /search?q=hello&page=2
 * function SearchResults() {
 *   const search = useSearchParams();
 *   return <div>Query: {search.q}, Page: {search.page}</div>;
 * }
 * ```
 */
export function useSearchParams(): Search {
  return $router.value.search;
}

/**
 * Returns the full router state
 *
 * @example
 * ```tsx
 * function Component() {
 *   const router = useRouter();
 *   return <div>Current path: {router.path}</div>;
 * }
 * ```
 */
export function useRouter(): RouterState {
  return $router.value;
}

/**
 * Returns a navigation function
 *
 * @example
 * ```tsx
 * function Component() {
 *   const navigate = useNavigate();
 *
 *   return (
 *     <button onClick={() => navigate('/about')}>
 *       Go to About
 *     </button>
 *   );
 * }
 * ```
 */
export function useNavigate(): typeof open {
  return open;
}

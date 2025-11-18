/**
 * @zen/router-zen
 *
 * Zen framework components for Zen Router
 * Powered by @zen/router
 */

export { Router } from './Router.js';
export { Link } from './Link.js';
export { useParams, useSearchParams, useNavigate, useRouter } from './hooks.js';

// Re-export router core for convenience
export { $router, defineRoutes, open, redirect } from '@zen/router';
export type { RouterState, Params, Search } from '@zen/router';

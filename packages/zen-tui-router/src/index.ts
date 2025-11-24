/**
 * @zen/tui-router - Router components for @zen/tui
 *
 * Client-side routing for terminal UIs powered by @zen/router-core.
 */

export { Router, type TUIRoute, type RouterProps } from './Router.js';
export { RouterLink, type RouterLinkProps } from './RouterLink.js';

// Re-export @zen/router-core primitives for convenience
export {
  $router,
  defineRoutes,
  startHistoryListener,
  stopHistoryListener,
  open,
  back,
  forward,
  replace,
  type RouteConfig,
  type RouterState,
} from '@zen/router-core';

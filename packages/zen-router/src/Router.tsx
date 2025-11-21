/**
 * Router component for Zen framework
 * Powered by @zen/router-core
 */

import { $router, defineRoutes, startHistoryListener, stopHistoryListener } from '@zen/router-core';
import type { RouteConfig } from '@zen/router-core';
import { disposeNode, effect, onCleanup, onMount, untrack } from '@zen/signal';
import { executeDescriptor, isDescriptor } from '@zen/runtime';

export interface ZenRoute {
  path: string;
  component: () => unknown; // May return Node or ComponentDescriptor
}

interface RouterProps {
  routes: ZenRoute[];
  fallback?: () => unknown; // May return Node or ComponentDescriptor
}

/**
 * Router component - Client-side routing powered by @zen/router-core
 *
 * Supports descriptor pattern (ADR-011) for proper Context propagation.
 *
 * @example
 * ```tsx
 * <Router routes={[
 *   { path: '/', component: () => <Home /> },
 *   { path: '/users/:id', component: () => <UserProfile /> },
 *   { path: '/about', component: () => <About /> },
 * ]} fallback={() => <NotFound />} />
 * ```
 */
export function Router(props: RouterProps): Node {
  const { routes, fallback } = props;

  const container = document.createElement('div');
  container.className = 'zen-router-container';
  let currentNode: Node | null = null;
  let effectDispose: (() => void) | undefined;

  // Helper to find and render matching route
  function renderRoute(path: string): Node {
    const route = routes.find((r) => r.path === path);

    let result: unknown;
    if (route) {
      result = route.component();
    } else if (fallback) {
      result = fallback();
    } else {
      return document.createTextNode('404 Not Found');
    }

    // Handle descriptor (Phase 2)
    if (isDescriptor(result)) {
      result = executeDescriptor(result);
    }

    // Ensure result is a Node
    if (!(result instanceof Node)) {
      console.error('Router: component must return a DOM Node, got:', typeof result, result);
      return document.createTextNode('Error: Invalid component');
    }

    return result;
  }

  // Render initial route based on current URL
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  currentNode = renderRoute(initialPath);
  container.appendChild(currentNode);

  // Initialize router
  onMount(() => {
    // Convert ZenRoute to RouteConfig
    const routeConfigs: RouteConfig[] = routes.map((r) => ({
      path: r.path,
      component: r.component,
    }));

    defineRoutes(routeConfigs);
    startHistoryListener();

    // Set up effect for reactive navigation
    effectDispose = effect(() => {
      const { path } = $router.value;

      // Cleanup previous node
      if (currentNode) {
        if (currentNode.parentNode) {
          currentNode.parentNode.removeChild(currentNode);
        }
        disposeNode(currentNode);
        currentNode = null;
      }

      // Render new route
      currentNode = untrack(() => renderRoute(path));

      // Insert into container
      if (currentNode && container) {
        container.appendChild(currentNode);
      }

      return undefined;
    });

    // Cleanup on unmount
    onCleanup(() => {
      stopHistoryListener();
    });

    return undefined;
  });

  // Register cleanup via owner system
  onCleanup(() => {
    if (effectDispose) {
      effectDispose();
    }
    if (currentNode) {
      if (currentNode.parentNode) {
        currentNode.parentNode.removeChild(currentNode);
      }
      disposeNode(currentNode);
    }
  });

  return container;
}

import { get, subscribe } from '@sylphx/zen';
import { $router, type RouterState } from '@sylphx/zen-router';
import { useEffect, useState } from 'preact/hooks'; // Import hooks from preact

/**
 * Preact hook to subscribe to the router state.
 *
 * Returns the current router state object ({ path, params, search }).
 * The component will re-render when the router state changes.
 *
 * @returns The current router state.
 */
export function useRouter(): RouterState {
  // Get the initial state synchronously
  const [state, setState] = useState<RouterState>(get($router));

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = subscribe($router, (newState: RouterState) => {
      // Update state on change
      setState(newState);
    });

    // Unsubscribe on component unmount
    return unsubscribe;
  }, []); // Empty dependency array: subscribe only on mount, unsubscribe on unmount.

  return state;
}

/**
 * Preact hook to track URL hash changes.
 *
 * Returns the current hash (e.g., '#section' or '').
 * This is a standalone utility that listens to browser's hashchange event.
 * Does NOT depend on router state - works with any hash changes.
 *
 * @returns The current hash string.
 */
export function useHash(): string {
  const [hash, setHash] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash : '',
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashChange = () => setHash(window.location.hash);

    // Listen to browser's native hashchange event
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return hash;
}

// Re-export core types for convenience
export type { RouterState, Params, Search } from '@sylphx/zen-router';

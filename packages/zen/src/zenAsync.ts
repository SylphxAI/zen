// ZenAsync: Full Reactive Async Store (like Riverpod AsyncProvider)
import type { AnyZen, Listener, Unsubscribe, ZenAsync, ZenAsyncState } from './types';

// --- Type Definitions ---

export type QueryKey = readonly unknown[];

export interface ZenAsyncOptions<Args extends unknown[] = unknown[]> {
  /** Function to generate cache key. Returns array like ['user', id]. Default: JSON.stringify(args) */
  cacheKey?: (...args: Args) => QueryKey;

  /** Keep cache alive even when no listeners. Default: false (auto-dispose) */
  keepAlive?: boolean;

  /** Time to keep cache after last listener removed (ms). Default: 30000 (30s) */
  cacheTime?: number;

  /** Time until cache is considered stale (ms). Triggers background refetch. */
  staleTime?: number;
}

/** @deprecated Use ZenAsyncOptions instead */
export type KarmaOptions<Args extends unknown[] = unknown[]> = ZenAsyncOptions<Args>;

// Per-parameter cache entry (reactive!)
interface CacheEntry<T> {
  // Cached data
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  timestamp: number;

  // Reactive state
  listeners: Set<Listener<ZenAsyncState<T>>>;
  runningPromise: Promise<T> | undefined;

  // Lifecycle
  disposeTimer?: ReturnType<typeof setTimeout>;
}

// --- Global Cache (all karma instances share by default) ---

const globalZenAsyncCache = new WeakMap<
  ZenAsync<unknown, unknown[]>,
  Map<string, CacheEntry<unknown>>
>();

// --- Helper Functions ---

/** Get cache map for a karma instance */
function getCacheMap<T, Args extends unknown[]>(
  karma: ZenAsync<T, Args>,
): Map<string, CacheEntry<T>> {
  const k = karma as ZenAsync<unknown, unknown[]>;
  let cache = globalZenAsyncCache.get(k) as Map<string, CacheEntry<T>> | undefined;

  if (!cache) {
    cache = new Map<string, CacheEntry<T>>();
    globalZenAsyncCache.set(k, cache as Map<string, CacheEntry<unknown>>);
  }

  return cache;
}

/** Generate cache key string from args */
function generateCacheKey<Args extends unknown[]>(
  karma: ZenAsync<unknown, Args>,
  args: Args,
): string {
  if (karma._cacheKeyFn) {
    const key = karma._cacheKeyFn(...args);
    return JSON.stringify(key);
  }
  return JSON.stringify(args);
}

/** Get or create cache entry for specific args */
function getOrCreateCacheEntry<T, Args extends unknown[]>(
  karma: ZenAsync<T, Args>,
  args: Args,
): CacheEntry<T> {
  const cache = getCacheMap(karma);
  const key = generateCacheKey(karma, args);

  let entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    entry = {
      data: undefined,
      error: undefined,
      loading: false,
      timestamp: 0,
      listeners: new Set(),
      runningPromise: undefined,
    };
    cache.set(key, entry as CacheEntry<unknown>);
  }

  return entry;
}

/** Get current state from cache entry */
function getStateFromEntry<T>(entry: CacheEntry<T>): ZenAsyncState<T> {
  if (entry.loading) {
    return { loading: true, error: undefined, data: undefined };
  }
  if (entry.error) {
    return { loading: false, error: entry.error, data: undefined };
  }
  if (entry.data !== undefined) {
    return { loading: false, error: undefined, data: entry.data };
  }
  return { loading: false, error: undefined, data: undefined };
}

// --- Core Reactive Logic ---

/**
 * Execute async function and update cache entry (reactive!)
 */
async function executeFetch<T, Args extends unknown[]>(
  karma: ZenAsync<T, Args>,
  args: Args,
  entry: CacheEntry<T>,
): Promise<T> {
  // Check if already running
  if (entry.runningPromise) {
    return entry.runningPromise;
  }

  // Update state to loading
  const oldLoading = entry.loading;
  entry.loading = true;
  entry.error = undefined;

  // Notify all listeners of loading state (if changed)
  if (!oldLoading) {
    const loadingState: ZenAsyncState<T> = { loading: true, error: undefined, data: undefined };
    for (const listener of entry.listeners) {
      listener(loadingState);
    }
  }

  // Execute async function
  const promise = karma._asyncFn(...args);
  entry.runningPromise = promise;

  try {
    const result = await promise;

    // Only update if this promise is still current
    if (entry.runningPromise === promise) {
      const _oldData = entry.data;
      entry.data = result;
      entry.error = undefined;
      entry.loading = false;
      entry.timestamp = Date.now();
      entry.runningPromise = undefined;

      // Notify all listeners of success (if data changed)
      const successState: ZenAsyncState<T> = { loading: false, error: undefined, data: result };
      for (const listener of entry.listeners) {
        listener(successState);
      }
    }

    return result;
  } catch (error) {
    // Only update if this promise is still current
    if (entry.runningPromise === promise) {
      const errorObj = error instanceof Error ? error : new Error(String(error ?? 'Unknown error'));
      entry.error = errorObj;
      entry.data = undefined;
      entry.loading = false;
      entry.timestamp = Date.now();
      entry.runningPromise = undefined;

      // Notify all listeners of error
      const errorState: ZenAsyncState<T> = { loading: false, error: errorObj, data: undefined };
      for (const listener of entry.listeners) {
        listener(errorState);
      }
    }

    throw error;
  }
}

/**
 * Subscribe to cache entry (reactive!)
 */
function subscribeToEntry<T>(
  entry: CacheEntry<T>,
  listener: Listener<ZenAsyncState<T>>,
): Unsubscribe {
  // Add listener
  entry.listeners.add(listener);

  // Cancel dispose timer if exists
  if (entry.disposeTimer) {
    clearTimeout(entry.disposeTimer);
    entry.disposeTimer = undefined;
  }

  // Immediately notify listener of current state
  const currentState = getStateFromEntry(entry);
  listener(currentState);

  // Return unsubscribe function
  return () => {
    entry.listeners.delete(listener);
  };
}

/**
 * Schedule disposal of cache entry (auto-dispose)
 */
function scheduleDispose<T, Args extends unknown[]>(
  karma: ZenAsync<T, Args>,
  entry: CacheEntry<T>,
  cacheKey: string,
): void {
  // Don't dispose if keepAlive
  if (karma._keepAlive) {
    return;
  }

  // Don't dispose if still has listeners
  if (entry.listeners.size > 0) {
    return;
  }

  // Cancel existing timer
  if (entry.disposeTimer) {
    clearTimeout(entry.disposeTimer);
  }

  // Schedule disposal
  const cacheTime = karma._cacheTime ?? 30000; // 30s default
  entry.disposeTimer = setTimeout(() => {
    // Double-check no listeners were added
    if (entry.listeners.size === 0) {
      const cache = getCacheMap(karma);
      cache.delete(cacheKey);
    }
  }, cacheTime);
}

// --- Factory ---

/**
 * Creates a reactive async karma store (like Riverpod AsyncProvider)
 *
 * @template T The type of data returned by async function
 * @param asyncFn The async function to execute
 * @param options Configuration options
 * @returns ZenAsync instance with reactive caching
 *
 * @example
 * ```typescript
 * const fetchUser = karma(
 *   async (id: number) => fetchUserAPI(id),
 *   {
 *     cacheKey: (id) => ['user', id],
 *     keepAlive: false, // Auto-dispose when no listeners
 *     cacheTime: 30000, // Keep cache 30s after last listener
 *     staleTime: 5000,  // Background refetch if older than 5s
 *   }
 * );
 * ```
 */
export function zenAsync<T = void, Args extends unknown[] = unknown[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options?: ZenAsyncOptions<Args>,
): ZenAsync<T, Args> {
  const zenAsyncInstance: ZenAsync<T, Args> = {
    _kind: 'zenAsync',
    _value: { loading: false }, // Legacy, not used in v2
    _asyncFn: asyncFn,
    _cacheKeyFn: options?.cacheKey,
    _keepAlive: options?.keepAlive ?? false,
    _cacheTime: options?.cacheTime,
    _staleTime: options?.staleTime,
  };

  return zenAsyncInstance;
}

// --- API ---

/**
 * Run karma async function with reactive caching
 *
 * Performance: Returns cached data immediately if available, no re-run needed.
 *
 * @param karma The karma instance
 * @param args Arguments to pass to async function
 * @returns Promise that resolves with data
 *
 * @example
 * ```typescript
 * // First call: fetches
 * await runZenAsync(fetchUser, 1);
 *
 * // Second call: returns cache immediately (no refetch!)
 * await runZenAsync(fetchUser, 1);
 *
 * // Different args: fetches
 * await runZenAsync(fetchUser, 2);
 * ```
 */
export function runZenAsync<T, Args extends unknown[]>(
  karma: ZenAsync<T, Args>,
  ...args: Args
): Promise<T> {
  const entry = getOrCreateCacheEntry(karma, args);

  // Check if cached data exists
  if (entry.data !== undefined && !entry.loading) {
    const age = Date.now() - entry.timestamp;
    const isStale = karma._staleTime !== undefined && age > karma._staleTime;

    if (isStale) {
      // Stale-while-revalidate: return cache + background refetch
      Promise.resolve().then(() => {
        executeFetch(karma, args, entry).catch(() => {
          // Error already stored in entry and notified to listeners
        });
      });
    }

    return Promise.resolve(entry.data);
  }

  // No cache or loading, execute fetch
  return executeFetch(karma, args, entry);
}

/**
 * Subscribe to karma for specific arguments (fully reactive!)
 *
 * - Auto-fetches if no data
 * - Receives updates when data changes
 * - Auto-disposes cache when last listener unsubscribes
 *
 * @param karma The karma instance
 * @param args Arguments for the async function
 * @param listener Callback that receives state updates
 * @returns Unsubscribe function
 *
 * @example
 * ```typescript
 * const unsub = subscribeToZenAsync(fetchUser, [1], (state) => {
 *   if (state.loading) console.log('Loading...');
 *   if (state.data) console.log('User:', state.data);
 *   if (state.error) console.log('Error:', state.error);
 * });
 *
 * // Later
 * unsub(); // Auto-dispose after cacheTime
 * ```
 */
export function subscribeToZenAsync<T, Args extends unknown[]>(
  karma: ZenAsync<T, Args>,
  args: Args,
  listener: Listener<ZenAsyncState<T>>,
): Unsubscribe {
  const entry = getOrCreateCacheEntry(karma, args);
  const key = generateCacheKey(karma, args);

  const unsub = subscribeToEntry(entry, listener);

  // Trigger initial fetch if no data and not loading
  if (entry.data === undefined && !entry.loading && !entry.runningPromise) {
    executeFetch(karma, args, entry).catch(() => {
      // Error already stored in entry and notified to listeners
    });
  }

  // Return enhanced unsubscribe that handles auto-dispose
  return () => {
    unsub();
    scheduleDispose(karma, entry, key);
  };
}

/**
 * Get current karma state for specific arguments (no subscription)
 *
 * @param karma The karma instance
 * @param args Arguments for the async function
 * @returns Current state snapshot
 */
export function getZenAsyncState<T, Args extends unknown[]>(
  karma: ZenAsync<T, Args>,
  args: Args,
): ZenAsyncState<T> {
  const entry = getOrCreateCacheEntry(karma, args);
  return getStateFromEntry(entry);
}

// --- Global Cache API ---

/**
 * Global cache control API for karma instances
 */
export const zenAsyncCache = {
  /**
   * Get current cached state (no fetch, no subscription)
   */
  get<T, Args extends unknown[]>(
    karma: ZenAsync<T, Args>,
    ...args: Args
  ): ZenAsyncState<T> | undefined {
    const cache = getCacheMap(karma);
    const key = generateCacheKey(karma, args);
    const entry = cache.get(key) as CacheEntry<T> | undefined;

    return entry ? getStateFromEntry(entry) : undefined;
  },

  /**
   * Set cached data (optimistic update, reactive!)
   *
   * Notifies all active listeners immediately.
   */
  set<T, Args extends unknown[]>(karma: ZenAsync<T, Args>, args: Args, data: T): void {
    const entry = getOrCreateCacheEntry(karma, args);

    entry.data = data;
    entry.error = undefined;
    entry.loading = false;
    entry.timestamp = Date.now();

    // Notify all listeners (reactive!)
    const state: ZenAsyncState<T> = { loading: false, error: undefined, data };
    for (const listener of entry.listeners) {
      listener(state);
    }
  },

  /**
   * Invalidate cache (triggers re-fetch for active listeners - fully reactive!)
   *
   * If entry has active listeners, immediately triggers refetch.
   * If no listeners, just clears cache.
   */
  invalidate<T, Args extends unknown[]>(karma: ZenAsync<T, Args>, ...args: Args): void {
    const cache = getCacheMap(karma);
    const key = generateCacheKey(karma, args);
    const entry = cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return;
    }

    // Clear cached data
    entry.data = undefined;
    entry.error = undefined;
    entry.timestamp = 0;

    // If has active listeners, trigger re-fetch (reactive!)
    if (entry.listeners.size > 0) {
      executeFetch(karma, args, entry).catch(() => {
        // Error already stored in entry and notified to listeners
      });
    }
  },

  /**
   * Invalidate all cache entries for this karma
   */
  invalidateAll<T>(karma: ZenAsync<T, unknown[]>): void {
    const cache = getCacheMap(karma);

    // Clear all entries
    // Note: Cannot trigger refetch without args, just clear
    cache.clear();
  },

  /**
   * Force dispose cache entry (even if has listeners)
   */
  dispose<T, Args extends unknown[]>(karma: ZenAsync<T, Args>, ...args: Args): void {
    const cache = getCacheMap(karma);
    const key = generateCacheKey(karma, args);
    const entry = cache.get(key) as CacheEntry<T> | undefined;

    if (entry?.disposeTimer) {
      clearTimeout(entry.disposeTimer);
    }

    cache.delete(key);
  },

  /**
   * Get cache statistics (debug)
   */
  stats<T>(karma: ZenAsync<T, unknown[]>): {
    entries: number;
    totalListeners: number;
    cacheKeys: string[];
  } {
    const cache = getCacheMap(karma);
    let totalListeners = 0;

    for (const entry of cache.values()) {
      totalListeners += (entry as CacheEntry<T>).listeners.size;
    }

    return {
      entries: cache.size,
      totalListeners,
      cacheKeys: Array.from(cache.keys()),
    };
  },
};

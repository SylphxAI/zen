import { afterEach, describe, expect, it, vi } from 'vitest';
import { getKarmaState, karma, runKarma, subscribeToKarma, karmaCache } from './karma';

// Helper to wait for promises/microtasks
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('karma (Full Reactive)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic reactive caching', () => {
    it('should cache results per parameter', async () => {
      let execCount = 0;
      const fetchUser = karma(async (id: number) => {
        execCount++;
        await tick();
        return { id, name: `User ${id}` };
      });

      // First call: executes
      const result1 = await runKarma(fetchUser, 1);
      expect(result1).toEqual({ id: 1, name: 'User 1' });
      expect(execCount).toBe(1);

      // Second call (same args): returns cache immediately
      const result2 = await runKarma(fetchUser, 1);
      expect(result2).toEqual({ id: 1, name: 'User 1' });
      expect(execCount).toBe(1); // No re-execution!

      // Third call (different args): executes
      const result3 = await runKarma(fetchUser, 2);
      expect(result3).toEqual({ id: 2, name: 'User 2' });
      expect(execCount).toBe(2);
    });

    it('should return cached data synchronously', async () => {
      const fetchData = karma(async (id: number) => {
        await tick();
        return `Data ${id}`;
      });

      // First call
      await runKarma(fetchData, 1);

      // Second call should resolve immediately (no await needed to verify cache)
      const start = Date.now();
      const result = await runKarma(fetchData, 1);
      const duration = Date.now() - start;

      expect(result).toBe('Data 1');
      expect(duration).toBeLessThan(5); // Should be instant
    });
  });

  describe('Reactive subscriptions', () => {
    it('should notify subscribers of state changes', async () => {
      const fetchUser = karma(async (id: number) => {
        await tick();
        return { id, name: `User ${id}` };
      });

      const states: any[] = [];
      const unsub = subscribeToKarma(fetchUser, [1], (state) => {
        states.push({ ...state });
      });

      // Initial state (loading)
      await tick();
      expect(states[0]).toEqual({ loading: false }); // Initial
      expect(states[1]).toEqual({ loading: true }); // Started fetch

      await tick();
      await tick();

      // Success state
      expect(states[2]).toMatchObject({
        loading: false,
        data: { id: 1, name: 'User 1' },
      });

      unsub();
    });

    it('should auto-fetch when subscribing to empty cache', async () => {
      let execCount = 0;
      const fetchUser = karma(async (id: number) => {
        execCount++;
        await tick();
        return { id };
      });

      const states: any[] = [];
      const unsub = subscribeToKarma(fetchUser, [1], (state) => {
        states.push(state);
      });

      // Subscribe triggers immediate fetch
      expect(execCount).toBe(1); // Auto-fetch triggered synchronously

      await tick();
      await tick();

      expect(states[states.length - 1]).toMatchObject({ data: { id: 1 } });

      unsub();
    });

    it('should not auto-fetch if cache exists', async () => {
      let execCount = 0;
      const fetchUser = karma(async (id: number) => {
        execCount++;
        await tick();
        return { id };
      });

      // Prime cache
      await runKarma(fetchUser, 1);
      expect(execCount).toBe(1);

      // Subscribe to cached data
      const states: any[] = [];
      const unsub = subscribeToKarma(fetchUser, [1], (state) => {
        states.push(state);
      });

      await tick();
      expect(execCount).toBe(1); // No additional fetch

      // Should immediately get cached data
      expect(states[0]).toMatchObject({ data: { id: 1 } });

      unsub();
    });
  });

  describe('Auto-dispose (default)', () => {
    it('should dispose cache after cacheTime when no listeners', async () => {
      let execCount = 0;
      const fetchUser = karma(
        async (id: number) => {
          execCount++;
          await tick();
          return { id };
        },
        { cacheTime: 50 } // 50ms
      );

      // Subscribe and unsubscribe
      const unsub = subscribeToKarma(fetchUser, [1], () => {});
      await tick();
      await tick();

      expect(execCount).toBe(1);
      expect(karmaCache.stats(fetchUser).entries).toBe(1);

      unsub(); // Last listener removed

      // Wait for disposal
      await new Promise(r => setTimeout(r, 100));

      expect(karmaCache.stats(fetchUser).entries).toBe(0); // Disposed
    });

    it('should cancel disposal if listener re-added', async () => {
      const fetchUser = karma(
        async (id: number) => {
          await tick();
          return { id };
        },
        { cacheTime: 50 }
      );

      const unsub1 = subscribeToKarma(fetchUser, [1], () => {});
      await tick();
      await tick();

      unsub1(); // Start disposal timer

      // Re-add listener before disposal
      await new Promise(r => setTimeout(r, 25));
      const unsub2 = subscribeToKarma(fetchUser, [1], () => {});

      // Wait past original disposal time
      await new Promise(r => setTimeout(r, 50));

      expect(karmaCache.stats(fetchUser).entries).toBe(1); // Still cached!

      unsub2();
    });
  });

  describe('keepAlive option', () => {
    it('should keep cache alive even when no listeners', async () => {
      const fetchUser = karma(
        async (id: number) => {
          await tick();
          return { id };
        },
        { keepAlive: true }
      );

      const unsub = subscribeToKarma(fetchUser, [1], () => {});
      await tick();
      await tick();

      unsub(); // Remove listener

      // Wait (would normally dispose)
      await new Promise(r => setTimeout(r, 100));

      expect(karmaCache.stats(fetchUser).entries).toBe(1); // Still cached!
    });
  });

  describe('karmaCache.invalidate (reactive!)', () => {
    it('should trigger re-fetch for active listeners', async () => {
      let execCount = 0;
      const fetchUser = karma(async (id: number) => {
        execCount++;
        await tick();
        return { id, timestamp: Date.now() };
      });

      const states: any[] = [];
      const unsub = subscribeToKarma(fetchUser, [1], (state) => {
        if (state.data) states.push(state.data);
      });

      await tick();
      await tick();

      expect(execCount).toBe(1);
      expect(states.length).toBe(1);
      const firstTimestamp = states[0].timestamp;

      // Invalidate (should trigger re-fetch)
      karmaCache.invalidate(fetchUser, 1);

      await tick();
      await tick();

      expect(execCount).toBe(2); // Re-fetched!
      expect(states.length).toBe(2);
      expect(states[1].timestamp).toBeGreaterThan(firstTimestamp);

      unsub();
    });

    it('should not re-fetch if no active listeners', async () => {
      let execCount = 0;
      const fetchUser = karma(async (id: number) => {
        execCount++;
        await tick();
        return { id };
      });

      await runKarma(fetchUser, 1);
      expect(execCount).toBe(1);

      // Invalidate without listeners
      karmaCache.invalidate(fetchUser, 1);

      await tick();
      expect(execCount).toBe(1); // No re-fetch
    });
  });

  describe('karmaCache.set (optimistic update)', () => {
    it('should update cache and notify listeners', async () => {
      const fetchUser = karma(async (id: number) => {
        await tick();
        return { id, name: `User ${id}` };
      });

      const states: any[] = [];
      const unsub = subscribeToKarma(fetchUser, [1], (state) => {
        if (state.data) states.push(state.data);
      });

      await tick();
      await tick();

      expect(states[0]).toEqual({ id: 1, name: 'User 1' });

      // Optimistic update
      karmaCache.set(fetchUser, [1], { id: 1, name: 'Updated User' });

      expect(states[1]).toEqual({ id: 1, name: 'Updated User' });

      unsub();
    });
  });

  describe('staleTime (stale-while-revalidate)', () => {
    it('should trigger background refetch when stale', async () => {
      let execCount = 0;
      const fetchUser = karma(
        async (id: number) => {
          execCount++;
          await tick();
          return { id, fetch: execCount };
        },
        { staleTime: 50 } // 50ms
      );

      // First fetch
      const result1 = await runKarma(fetchUser, 1);
      expect(result1).toEqual({ id: 1, fetch: 1 });
      expect(execCount).toBe(1);

      // Wait for stale
      await new Promise(r => setTimeout(r, 60));

      // Second call: returns stale cache + triggers background refetch
      const result2 = await runKarma(fetchUser, 1);
      expect(result2).toEqual({ id: 1, fetch: 1 }); // Stale cache returned immediately

      // Background refetch should complete soon
      await tick();
      await tick();

      expect(execCount).toBe(2); // Background refetch executed

      // Third call: returns fresh cache
      const result3 = await runKarma(fetchUser, 1);
      expect(result3).toEqual({ id: 1, fetch: 2 });
    });
  });

  describe('Error handling', () => {
    it('should cache error state', async () => {
      let shouldFail = true;
      const fetchUser = karma(async (id: number) => {
        await tick();
        if (shouldFail) throw new Error('Failed');
        return { id };
      });

      try {
        await runKarma(fetchUser, 1);
      } catch (e) {
        expect((e as Error).message).toBe('Failed');
      }

      // Error should be cached
      const state = karmaCache.get(fetchUser, 1);
      expect(state?.error).toBeDefined();
      expect(state?.error?.message).toBe('Failed');
    });

    it('should notify subscribers of errors', async () => {
      const fetchUser = karma(async (id: number) => {
        await tick();
        throw new Error('Failed');
      });

      const states: any[] = [];
      const unsub = subscribeToKarma(fetchUser, [1], (state) => {
        states.push({ ...state });
      });

      await tick();
      await tick();

      expect(states[states.length - 1]).toMatchObject({
        loading: false,
        error: expect.objectContaining({ message: 'Failed' }),
      });

      unsub();
    });
  });

  describe('Multiple listeners per parameter', () => {
    it('should notify all listeners for same args', async () => {
      const fetchUser = karma(async (id: number) => {
        await tick();
        return { id };
      });

      const states1: any[] = [];
      const states2: any[] = [];

      const unsub1 = subscribeToKarma(fetchUser, [1], (state) => {
        if (state.data) states1.push(state.data);
      });

      const unsub2 = subscribeToKarma(fetchUser, [1], (state) => {
        if (state.data) states2.push(state.data);
      });

      await tick();
      await tick();

      // Both should receive data
      expect(states1[0]).toEqual({ id: 1 });
      expect(states2[0]).toEqual({ id: 1 });

      // Invalidate should notify both
      karmaCache.invalidate(fetchUser, 1);

      await tick();
      await tick();

      expect(states1.length).toBe(2);
      expect(states2.length).toBe(2);

      unsub1();
      unsub2();
    });
  });

  describe('getKarmaState', () => {
    it('should return current state for args', async () => {
      const fetchUser = karma(async (id: number) => {
        await tick();
        return { id };
      });

      // Before fetch
      const state1 = getKarmaState(fetchUser, [1]);
      expect(state1).toEqual({ loading: false });

      // During fetch
      const promise = runKarma(fetchUser, 1);
      const state2 = getKarmaState(fetchUser, [1]);
      expect(state2.loading).toBe(true);

      await promise;

      // After fetch
      const state3 = getKarmaState(fetchUser, [1]);
      expect(state3).toMatchObject({ loading: false, data: { id: 1 } });
    });
  });

  describe('karmaCache.stats', () => {
    it('should return cache statistics', async () => {
      const fetchUser = karma(async (id: number) => {
        await tick();
        return { id };
      });

      await runKarma(fetchUser, 1);
      await runKarma(fetchUser, 2);

      const stats = karmaCache.stats(fetchUser);
      expect(stats.entries).toBe(2);
      expect(stats.totalListeners).toBe(0);
      expect(stats.cacheKeys.length).toBe(2);
    });

    it('should track listener count', async () => {
      const fetchUser = karma(async (id: number) => {
        await tick();
        return { id };
      });

      const unsub1 = subscribeToKarma(fetchUser, [1], () => {});
      const unsub2 = subscribeToKarma(fetchUser, [1], () => {});
      const unsub3 = subscribeToKarma(fetchUser, [2], () => {});

      await tick();

      const stats = karmaCache.stats(fetchUser);
      expect(stats.totalListeners).toBe(3);

      unsub1();
      unsub2();
      unsub3();
    });
  });
});

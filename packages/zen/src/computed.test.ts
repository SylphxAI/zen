import { afterEach, describe, expect, it, vi } from 'vitest';
import { computed, subscribe as subscribeToAtom, zen } from './zen'; // Use zen.ts's built-in computed with auto-tracking

// // Mock the internal subscribe/unsubscribe functions for dependency tracking test - REMOVED due to vi.mock error
// vi.mock('./atom', async (importOriginal) => {
//   const original = await importOriginal() as typeof import('./atom');
//   return {
//     ...original,
//     subscribe: vi.fn(original.subscribe), // Spy on subscribe (renamed from subscribeToAtom)
//   };
// });

describe('computed (functional)', () => {
  // // Clear mocks after each test in this suite - REMOVED due to vi.mock removal
  // afterEach(() => {
  //   vi.restoreAllMocks();
  //   // Clear specific mock history if needed
  //   (subscribeToAtom as any).mockClear?.(); // Keep mock clear target as subscribeToAtom for now
  // });

  it('should compute initial value correctly', () => {
    const count = zen(10);
    const double = computed(() => count.value * 2); // Auto-tracking: accesses count.value inside
    expect(double.value).toBe(20); // Use .value getter
  });

  it('should update when a dependency atom changes', () => {
    const count = zen(10);
    const double = computed(() => count.value * 2);

    // Subscribe to activate dependency tracking
    const unsub = subscribeToAtom(double as any, () => {});

    expect(double.value).toBe(20);
    count.value = 15;
    expect(double.value).toBe(30);

    unsub();
  });

  it('should notify listeners when computed value changes', () => {
    const count = zen(10);
    const double = computed(() => count.value * 2);
    const listener = vi.fn();

    const unsubscribe = subscribeToAtom(double as any, listener);
    // Initial call happens, store the value for comparison
    const initialValue = double.value; // Should be 20
    listener.mockClear(); // Reset after subscription

    // Test updates
    count.value = 15;
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(30, initialValue); // Pass initialValue as oldValue

    unsubscribe();
  });

  it('should not notify listeners if computed value does not change', () => {
    const count = zen(10);
    const parity = computed(() =>
      count.value % 2 === 0 ? 'even' : 'odd',
    );

    // Force initial calculation before subscribing
    expect(parity.value).toBe('even'); // 10 % 2 === 0

    const listener = vi.fn();
    const unsubscribe = subscribeToAtom(parity as any, listener);
    listener.mockClear(); // Clear call history after subscription

    count.value = 12; // Value changes, but computed result ('even') does not
    expect(parity.value).toBe('even');
    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('should handle multiple dependencies', () => {
    const num1 = zen(10);
    const num2 = zen(5);
    const sum = computed(() => num1.value + num2.value); // Auto-tracking: accesses both values
    const listener = vi.fn();

    const unsubscribe = subscribeToAtom(sum as any, listener);
    const initialSum = sum.value; // 15
    listener.mockClear(); // Clear after subscription

    num1.value = 20; // sum changes from 15 to 25
    expect(sum.value).toBe(25);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(25, initialSum);
    listener.mockClear();

    const intermediateSum = sum.value; // 25
    num2.value = 7; // sum changes from 25 to 27
    expect(sum.value).toBe(27);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(27, intermediateSum);

    unsubscribe();
  });

  it('should handle dependencies on other computed atoms', () => {
    const base = zen(10);
    const double = computed(() => base.value * 2);
    const quadruple = computed(() => double.value * 2); // Nested computed
    const listener = vi.fn();

    const unsubscribe = subscribeToAtom(quadruple as any, listener);
    const initialQuad = quadruple.value; // 40
    listener.mockClear(); // Clear after subscription

    base.value = 5;
    expect(quadruple.value).toBe(20); // 5 * 2 * 2
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(20, initialQuad);

    unsubscribe();
  });

  it('should unsubscribe from dependencies when last listener unsubscribes', () => {
    const dep1 = zen(1);
    const dep2 = zen(2);
    const computedSum = computed(() => dep1.value + dep2.value); // Auto-tracking
    const listener = vi.fn();

    // Cast to access internal properties for testing
    // biome-ignore lint/suspicious/noExplicitAny: Test setup requires cast
    const internalComputed = computedSum as any;

    // Initially, no unsubs (zen.ts uses _unsubs, not _unsubscribers)
    expect(internalComputed._unsubs).toBeUndefined();

    // Access value to trigger initial calculation and auto-tracking
    expect(computedSum.value).toBe(3); // 1 + 2

    // After first calculation, sources should be tracked and subscriptions created
    expect(internalComputed._unsubs).toBeInstanceOf(Array);
    expect(internalComputed._unsubs.length).toBe(2); // Should have subscribed to both deps

    // First subscribe adds a listener
    const unsub1 = subscribeToAtom(computedSum as any, listener);
    listener.mockClear();

    // Add a second listener - should NOT change unsubs array
    const unsub2 = subscribeToAtom(computedSum as any, () => {});
    expect(internalComputed._unsubs).toBeInstanceOf(Array);
    expect(internalComputed._unsubs.length).toBe(2);

    // Unsubscribe the second listener - should NOT unsubscribe from dependencies
    unsub2();
    expect(internalComputed._unsubs).toBeInstanceOf(Array); // Still subscribed

    // Unsubscribe the first (last) listener - should trigger unsubscribe from dependencies
    unsub1();
    expect(internalComputed._unsubs).toBeUndefined(); // Should be cleaned up
  });
});

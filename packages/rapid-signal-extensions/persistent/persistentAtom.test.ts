import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { persistentAtom } from './index';

// --- Mocks ---

// Simple in-memory mock for localStorage
let simpleStorageMock: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string): string | null => simpleStorageMock[key] ?? null,
  setItem: (key: string, value: string): void => { simpleStorageMock[key] = value; },
  removeItem: (key: string): void => { delete simpleStorageMock[key]; },
  clear: (): void => { simpleStorageMock = {}; },
  // Add length and key if needed by tests, otherwise omit for simplicity
  get length(): number { return Object.keys(simpleStorageMock).length; },
  key: (index: number): string | null => Object.keys(simpleStorageMock)[index] ?? null,
};

// --- Tests ---

describe('persistentAtom', () => {
  const TEST_KEY = 'testAtomKey';

  beforeEach(() => {
    // Assign the simple mock to globalThis for the test
    (globalThis as any).localStorage = localStorageMock;
    (globalThis as any).window = globalThis; // Make window available
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
    (globalThis as any).localStorage = undefined; // Clean up mock
    // Restore original localStorage if needed, though usually not necessary in test env
  });

  it('should initialize with initialValue if storage is empty', () => {
    const initial = { count: 0 };
    const store = persistentAtom(TEST_KEY, initial);
    expect(store.value).toEqual(initial);
    // Check if initial value was written to storage
    expect(localStorageMock.getItem(TEST_KEY)).toBe(JSON.stringify(initial));
  });

  it('should load value from storage if present', () => {
    const storedValue = { count: 10 };
    localStorageMock.setItem(TEST_KEY, JSON.stringify(storedValue));

    const initial = { count: 0 }; // Different initial value
    const store = persistentAtom(TEST_KEY, initial);

    // Value should be loaded from storage, overriding initialValue
    expect(store.value).toEqual(storedValue);
  });

  it('should update storage when atom value is set', () => {
    const initial = { count: 0 };
    const store = persistentAtom(TEST_KEY, initial);
    const newValue = { count: 5 };

    store.value = newValue;

    expect(store.value).toEqual(newValue);
    expect(localStorageMock.getItem(TEST_KEY)).toBe(JSON.stringify(newValue));
  });
});

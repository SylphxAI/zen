import { describe, expect, it } from 'bun:test';
import { createRoot, setPlatformOps } from '@zen/runtime';
import { tuiPlatformOps } from '../core/platform-ops.js';
import { Text } from '../primitives/Text.js';
import { FocusProvider, useFocusManager } from './focus.js';

// Initialize platform operations before tests
setPlatformOps(tuiPlatformOps);

describe('FocusProvider', () => {
  it('should create a focus provider', () => {
    let providerCreated = false;

    createRoot(() => {
      const provider = FocusProvider({ children: 'test' });
      providerCreated = provider !== undefined;
    });

    expect(providerCreated).toBe(true);
  });

  it('should provide focus context to children', () => {
    let testComplete = false;

    createRoot(() => {
      FocusProvider({
        get children() {
          // This getter executes within the Provider context
          const manager = useFocusManager();
          testComplete =
            manager !== null &&
            typeof manager.focus === 'function' &&
            typeof manager.focusNext === 'function' &&
            typeof manager.focusPrevious === 'function';
          return Text({ children: 'test' });
        },
      });
    });

    expect(testComplete).toBe(true);
  });
});

describe('Focus Management', () => {
  it('should provide all focus manager methods', () => {
    let testComplete = false;

    createRoot(() => {
      FocusProvider({
        get children() {
          const manager = useFocusManager();
          testComplete =
            typeof manager.focus === 'function' &&
            typeof manager.focusNext === 'function' &&
            typeof manager.focusPrevious === 'function' &&
            typeof manager.enableFocus === 'function' &&
            typeof manager.disableFocus === 'function';
          return Text({ children: 'test' });
        },
      });
    });

    expect(testComplete).toBe(true);
  });
});

describe('Lazy Children Pattern', () => {
  it('should support function children: {() => <Component />}', () => {
    let childrenExecuted = false;
    let contextAvailable = false;

    createRoot(() => {
      // This tests the lazy children pattern: <FocusProvider>{() => <Child />}</FocusProvider>
      // The function should be executed and the component should be rendered
      FocusProvider({
        children: () => {
          childrenExecuted = true;
          // Try to access the context - should work because we're inside the Provider
          try {
            const manager = useFocusManager();
            contextAvailable = typeof manager.focus === 'function';
          } catch {
            contextAvailable = false;
          }
          return Text({ children: 'lazy child' });
        },
      });
    });

    expect(childrenExecuted).toBe(true);
    expect(contextAvailable).toBe(true);
  });

  it('should execute descriptor returned from function children', () => {
    let componentCreated = false;

    // Custom component that sets a flag when created
    function ChildComponent() {
      componentCreated = true;
      return Text({ children: 'child' });
    }

    createRoot(() => {
      // The function returns a descriptor { _jsx: true, type: ChildComponent, props: {} }
      // This descriptor should be executed by Context.Provider
      FocusProvider({
        children: () => {
          // Simulating what JSX does: jsx(ChildComponent, {})
          // returns { _jsx: true, type: ChildComponent, props: {} }
          return {
            _jsx: true,
            type: ChildComponent,
            props: {},
          };
        },
      });
    });

    expect(componentCreated).toBe(true);
  });
});

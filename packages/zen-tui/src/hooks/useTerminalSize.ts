/**
 * useTerminalSize Hook
 *
 * Returns the current terminal dimensions and updates when resized.
 *
 * @example
 * ```tsx
 * function MyApp() {
 *   const { width, height } = useTerminalSize();
 *   return <Text>Terminal: {width}x{height}</Text>;
 * }
 * ```
 */

import { effect, onCleanup, signal } from '@zen/signal';

export interface TerminalSize {
  /** Terminal width in columns */
  width: number;
  /** Terminal height in rows */
  height: number;
}

// Global terminal size signals (shared across all hooks)
const terminalWidth = signal(process.stdout.columns || 80);
const terminalHeight = signal(process.stdout.rows || 24);

// Track if resize listener is set up
let resizeListenerActive = false;
let listenerCount = 0;

function handleResize() {
  terminalWidth.value = process.stdout.columns || 80;
  terminalHeight.value = process.stdout.rows || 24;
}

function setupResizeListener() {
  if (!resizeListenerActive && process.stdout.isTTY) {
    process.stdout.on('resize', handleResize);
    resizeListenerActive = true;
  }
  listenerCount++;
}

function teardownResizeListener() {
  listenerCount--;
  if (listenerCount <= 0 && resizeListenerActive) {
    process.stdout.off('resize', handleResize);
    resizeListenerActive = false;
    listenerCount = 0;
  }
}

/**
 * Hook to get terminal dimensions
 *
 * Returns reactive signals that update when terminal is resized.
 *
 * @returns Object with width and height properties
 */
export function useTerminalSize(): TerminalSize {
  // Set up resize listener
  setupResizeListener();

  // Clean up when component unmounts
  onCleanup(() => {
    teardownResizeListener();
  });

  return {
    get width() {
      return terminalWidth.value;
    },
    get height() {
      return terminalHeight.value;
    },
  };
}

/**
 * Get terminal size without reactivity
 *
 * Use this for one-time reads without setting up a listener.
 */
export function getTerminalSize(): TerminalSize {
  return {
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
  };
}

/**
 * Hook to react to terminal resize
 *
 * @param callback Called when terminal is resized with new dimensions
 *
 * @example
 * ```tsx
 * useTerminalResize((width, height) => {
 *   console.log(`Resized to ${width}x${height}`);
 * });
 * ```
 */
export function useTerminalResize(callback: (width: number, height: number) => void): void {
  const { width, height } = useTerminalSize();

  // Use effect to track changes and call callback
  let prevWidth = width;
  let prevHeight = height;

  effect(() => {
    const newWidth = terminalWidth.value;
    const newHeight = terminalHeight.value;

    if (newWidth !== prevWidth || newHeight !== prevHeight) {
      prevWidth = newWidth;
      prevHeight = newHeight;
      callback(newWidth, newHeight);
    }

    return undefined;
  });
}

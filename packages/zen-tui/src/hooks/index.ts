/**
 * Hooks - React-like hooks for TUI
 */

export { useInput, dispatchInput, type InputHandler, type Key } from './useInput.js';
export { useApp, type AppContext } from './useApp.js';
export {
  useMouse,
  useMouseClick,
  useMouseScroll,
  dispatchMouseEvent,
} from './useMouse.js';
export {
  useTerminalSize,
  useTerminalResize,
  getTerminalSize,
  type TerminalSize,
} from './useTerminalSize.js';

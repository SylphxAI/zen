/**
 * Utilities - Helper functions and internal utilities
 */

export {
  FocusProvider,
  useFocusManager,
  useFocus,
  type FocusManagerValue,
  type FocusableItem,
} from './focus.js';
export {
  hitTest,
  hitTestAll,
  findClickableAncestor,
  setHitTestLayout,
  clearHitTestLayout,
  type HitTestResult,
} from './hit-test.js';
export { terminalWidth } from './terminal-width.js';
export type { MouseEvent } from './mouse-parser.js';

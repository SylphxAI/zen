/**
 * Box component for TUI
 *
 * Container component with flexbox layout support.
 * Similar to <div> in web but for terminal.
 */

import { appendChild } from '../core/jsx-runtime.js';
import type { MouseClickEvent, TUINode, TUIStyle } from '../core/types.js';

export interface BoxProps {
  children?: any;
  style?: TUIStyle;
  /** Click handler - called when the box is clicked */
  onClick?: (event: MouseClickEvent) => void;
}

export function Box(props: BoxProps): TUINode {
  const node: TUINode = {
    type: 'box',
    tagName: 'box',
    props: props || {},
    children: [],
    style: props?.style || {},
  };

  // Handle children using appendChild for reactivity support
  if (props?.children !== undefined) {
    appendChild(node, props.children);
  }

  return node;
}

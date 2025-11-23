/**
 * ScrollBox component for TUI
 *
 * Container with scrollable content support.
 * Enables mouse wheel and keyboard navigation.
 */

import { effect, signal } from '@zen/signal';
import { appendChild } from '../jsx-runtime.js';
import { scheduleNodeUpdate } from '../render-context.js';
import type { TUINode, TUIStyle } from '../types.js';
import { useInput } from '../useInput.js';
import { useMouseScroll } from '../useMouse.js';

export interface ScrollBoxProps {
  children?: any;
  style?: TUIStyle;
  height: number; // Viewport height (required)
  scrollStep?: number; // Lines to scroll per step (default: 1)
  pageSize?: number; // Lines to scroll on page up/down (default: height - 1)
  scrollOffset?: any; // Optional external scroll offset signal (for integration with Scrollbar)
}

export function ScrollBox(props: ScrollBoxProps): TUINode {
  // Use external scrollOffset if provided, otherwise create internal one
  const scrollOffset = props.scrollOffset ?? signal(0);
  const scrollStep = props.scrollStep ?? 1;
  const pageSize = props.pageSize ?? Math.max(1, props.height - 1);

  // Handle mouse scroll
  useMouseScroll((direction) => {
    if (direction === 'up') {
      scrollOffset.value = Math.max(0, scrollOffset.value - scrollStep);
    } else {
      scrollOffset.value += scrollStep;
    }
  });

  // Handle keyboard navigation
  useInput((_input, key) => {
    if (key.upArrow) {
      scrollOffset.value = Math.max(0, scrollOffset.value - scrollStep);
    } else if (key.downArrow) {
      scrollOffset.value += scrollStep;
    } else if (key.pageUp) {
      scrollOffset.value = Math.max(0, scrollOffset.value - pageSize);
    } else if (key.pageDown) {
      scrollOffset.value += pageSize;
    }
  });

  // Create container node
  const node: TUINode = {
    type: 'box',
    tagName: 'scrollbox',
    props: {
      ...props,
      scrollOffset, // Store scroll state
    },
    children: [],
    style: {
      ...props?.style,
      height: props.height,
      overflow: 'hidden' as any, // Mark as scrollable container
    },
  };

  // Handle children using appendChild for reactivity support
  if (props?.children !== undefined) {
    appendChild(node, props.children);
  }

  // Track scrollOffset changes and trigger re-renders
  effect(() => {
    // Read scrollOffset to track it
    const _offset = scrollOffset.value;
    // Schedule a render update when scrollOffset changes
    scheduleNodeUpdate(node, '');
  });

  return node;
}

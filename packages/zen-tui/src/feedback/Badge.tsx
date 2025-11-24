/**
 * Badge component for TUI
 *
 * Small status indicator with colored background.
 */

import type { TUINode } from '../core/types.js';
import { Box } from '../primitives/Box.js';
import { Text } from '../primitives/Text.js';

export interface BadgeProps {
  children: string;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'cyan' | 'magenta' | 'white' | 'gray';
  style?: any;
}

export function Badge(props: BadgeProps): TUINode {
  const color = props.color || 'cyan';

  return Box({
    style: {
      backgroundColor: color,
      paddingX: 1,
      ...props.style,
    },
    children: Text({
      children: props.children,
      color: 'black',
      bold: true,
    }),
  });
}

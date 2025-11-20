/**
 * Button component for TUI
 *
 * Interactive button with visual feedback and keyboard support.
 */

import { type Signal, signal } from '@zen/runtime';
import { useFocusable } from '../focus';
import type { TUINode } from '../types';
import { Box } from './Box';
import { Text } from './Text';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  width?: number;
  id?: string;
}

export function Button(props: ButtonProps): TUINode {
  const id = props.id || `button-${Math.random().toString(36).slice(2, 9)}`;
  const disabled = props.disabled || false;
  const variant = props.variant || 'primary';
  const width = props.width;

  // Visual pressed state
  const isPressed = signal(false);

  const { isFocused } = useFocusable(id, {
    onFocus: () => {
      isPressed.value = false;
    },
  });

  const focused = isFocused();
  const pressed = isPressed.value;

  // Variant colors
  const colors = {
    primary: {
      bg: disabled ? 'gray' : pressed ? 'blue' : 'cyan',
      fg: disabled ? 'white' : 'black',
      border: 'cyan',
    },
    secondary: {
      bg: disabled ? 'gray' : pressed ? 'white' : undefined,
      fg: disabled ? 'white' : pressed ? 'black' : 'white',
      border: disabled ? 'gray' : 'white',
    },
    danger: {
      bg: disabled ? 'gray' : pressed ? 'red' : undefined,
      fg: disabled ? 'white' : 'red',
      border: 'red',
    },
  };

  const colorScheme = colors[variant];

  return Box({
    style: {
      borderStyle: focused ? 'round' : 'single',
      borderColor: disabled ? 'gray' : focused ? colorScheme.border : undefined,
      backgroundColor: colorScheme.bg,
      paddingX: 2,
      paddingY: 0,
      width,
      justifyContent: 'center',
    },
    children: Text({
      children: disabled ? `[${props.label}]` : props.label,
      color: colorScheme.fg,
      bold: !disabled && focused,
    }),
    props: { id, disabled, isPressed },
  });
}

/**
 * Handle button keyboard input
 * Call this from your app's onKeyPress handler for the focused button
 */
export function handleButton(
  isPressed: Signal<boolean>,
  disabled: boolean,
  key: string,
  onClick?: () => void,
): boolean {
  if (disabled) return false;

  // Enter or Space to activate
  if (key === '\r' || key === '\n' || key === ' ') {
    // Visual feedback: press and release
    isPressed.value = true;
    setTimeout(() => {
      isPressed.value = false;
    }, 100);

    onClick?.();
    return true;
  }

  return false;
}

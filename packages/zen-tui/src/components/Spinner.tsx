/**
 * Spinner component for TUI
 *
 * Animated loading spinner with multiple styles.
 */

import { type Signal, signal } from '@zen/runtime';
import type { TUINode } from '../types';
import { Text } from './Text';

export interface SpinnerProps {
  type?: 'dots' | 'line' | 'arc' | 'arrow';
  color?: string;
  label?: string;
}

const SPINNER_FRAMES = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['|', '/', '-', '\\'],
  arc: ['◜', '◠', '◝', '◞', '◡', '◟'],
  arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
};

/**
 * Spinner component
 * Note: Animation requires periodic re-rendering (use renderToTerminalReactive with fps)
 */
export function Spinner(props: SpinnerProps): TUINode {
  const type = props.type || 'dots';
  const color = props.color || 'cyan';
  const frames = SPINNER_FRAMES[type];

  // Frame index - should be incremented by parent/app logic
  // In a real app, this would be updated by a timer
  const frameIndex = signal(0);

  const currentFrame = frames[frameIndex.value % frames.length];

  const content = props.label ? `${currentFrame} ${props.label}` : currentFrame;

  return Text({
    children: content,
    color,
    props: { frameIndex, frames },
  });
}

/**
 * Update spinner frame
 * Call this periodically to animate the spinner
 */
export function updateSpinner(frameIndex: Signal<number>): void {
  frameIndex.value = (frameIndex.value + 1) % 100; // Prevent overflow
}

/**
 * Create an animated spinner that updates automatically
 * Returns cleanup function to stop the animation
 */
export function createAnimatedSpinner(
  props: SpinnerProps,
  intervalMs = 80,
): { node: TUINode; cleanup: () => void; frameIndex: Signal<number> } {
  const frameIndex = signal(0);
  const type = props.type || 'dots';
  const frames = SPINNER_FRAMES[type];

  const interval = setInterval(() => {
    frameIndex.value = (frameIndex.value + 1) % frames.length;
  }, intervalMs);

  const cleanup = () => clearInterval(interval);

  const node = Text({
    children: () => {
      const currentFrame = frames[frameIndex.value % frames.length];
      return props.label ? `${currentFrame} ${props.label}` : currentFrame;
    },
    color: props.color || 'cyan',
    props: { frameIndex, frames },
  });

  return { node, cleanup, frameIndex };
}

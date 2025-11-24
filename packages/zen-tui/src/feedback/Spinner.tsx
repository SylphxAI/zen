/**
 * Spinner component for TUI
 *
 * Animated loading spinner with multiple styles.
 */

import { type Signal, signal } from '@zen/runtime';
import type { TUINode } from '../core/types.js';
import { Text } from '../primitives/Text.js';

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
 * Spinner component - self-animating
 * Animation runs automatically using setInterval
 */
export function Spinner(props: SpinnerProps): TUINode {
  const type = props.type || 'dots';
  const color = props.color || 'cyan';
  const frames = SPINNER_FRAMES[type];
  const intervalMs = 80;

  // Self-animating frame index
  const frameIndex = signal(0);

  // Start animation interval
  const _interval = setInterval(() => {
    frameIndex.value = (frameIndex.value + 1) % frames.length;
  }, intervalMs);

  // Return Text with reactive children
  return Text({
    children: () => {
      const currentFrame = frames[frameIndex.value % frames.length];
      return props.label ? `${currentFrame} ${props.label}` : currentFrame;
    },
    color,
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
  });

  return { node, cleanup, frameIndex };
}

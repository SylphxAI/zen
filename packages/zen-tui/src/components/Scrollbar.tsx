/**
 * Scrollbar component for TUI
 *
 * Visual indicator showing scroll position and scrollable range.
 * Can be used standalone or with ScrollBox.
 */

import type { Signal } from '@zen/signal';
import type { TUINode, TUIStyle } from '../types.js';
import { Box } from './Box.js';
import { Text } from './Text.js';

export interface ScrollbarProps {
  scrollOffset: Signal<number>; // Current scroll offset
  contentHeight: number; // Total height of scrollable content
  viewportHeight: number; // Visible viewport height
  position?: 'left' | 'right'; // Scrollbar position (default: 'right')
  style?: TUIStyle;
  trackChar?: string; // Character for track (default: '│')
  thumbChar?: string; // Character for thumb (default: '█')
  trackColor?: string; // Color of track
  thumbColor?: string; // Color of thumb
}

export function Scrollbar(props: ScrollbarProps): TUINode {
  const {
    scrollOffset,
    contentHeight,
    viewportHeight,
    trackChar = '│',
    thumbChar = '█',
    trackColor = 'gray',
    thumbColor = 'cyan',
  } = props;

  // Calculate scrollbar dimensions
  const trackHeight = viewportHeight;
  const maxScroll = Math.max(0, contentHeight - viewportHeight);

  // Calculate thumb size (proportional to viewport vs content)
  const thumbSize = Math.max(1, Math.floor((viewportHeight / contentHeight) * trackHeight));

  // Calculate thumb position
  const getThumbPosition = (): number => {
    if (maxScroll === 0) return 0; // No scrolling needed
    const scrollRatio = scrollOffset.value / maxScroll;
    const availableSpace = trackHeight - thumbSize;
    return Math.floor(scrollRatio * availableSpace);
  };

  // Generate scrollbar lines
  const lines = (): TUINode[] => {
    const thumbPos = getThumbPosition();
    const result: TUINode[] = [];

    for (let i = 0; i < trackHeight; i++) {
      // Check if this line is part of the thumb
      const isThumb = i >= thumbPos && i < thumbPos + thumbSize;

      result.push(
        <Text
          style={{
            color: isThumb ? thumbColor : trackColor,
          }}
        >
          {isThumb ? thumbChar : trackChar}
        </Text>,
      );
    }

    return result;
  };

  return (
    <Box
      style={{
        ...props.style,
        flexDirection: 'column',
        width: 1,
        height: viewportHeight,
      }}
    >
      {() => lines()}
    </Box>
  );
}

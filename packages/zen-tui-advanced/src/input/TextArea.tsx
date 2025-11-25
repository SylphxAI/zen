/** @jsxImportSource @zen/tui */
/**
 * TextArea Component
 *
 * Simple multi-line text input for TUI applications.
 * Similar to HTML <textarea> - for general text input, NOT a code editor.
 *
 * Features:
 * - Multi-line text editing
 * - Cursor movement (arrows, home/end, page up/down)
 * - Soft text wrapping (default on)
 * - Keyboard scrolling for large content
 *
 * NOT included (use a CodeEditor component for these):
 * - Line numbers (available as opt-in prop, but off by default)
 * - Syntax highlighting
 * - Mouse scroll (future: opt-in via MouseProvider context)
 *
 * @example
 * ```tsx
 * const text = signal('Hello\nWorld');
 *
 * <TextArea
 *   value={text.value}
 *   onChange={(newValue) => text.value = newValue}
 *   rows={10}
 *   placeholder="Enter text..."
 * />
 * ```
 */

import { Box, Text, batch, computed, signal, useInput } from '@zen/tui';

export interface TextAreaProps {
  /** Current text value */
  value?: string;

  /** Callback when text changes */
  onChange?: (value: string) => void;

  /** Number of visible rows */
  rows?: number;

  /** Number of columns (width) */
  cols?: number;

  /** Placeholder text when empty */
  placeholder?: string;

  /** Show line numbers */
  showLineNumbers?: boolean;

  /** Enable line wrapping */
  wrap?: boolean;

  /** Read-only mode */
  readOnly?: boolean;

  /** Focus management */
  isFocused?: boolean;

  /** Border style */
  border?: boolean;
}

/**
 * TextArea Component
 *
 * Multi-line text editor for TUI applications.
 */
export function TextArea(props: TextAreaProps) {
  const {
    value: externalValue = '',
    onChange,
    rows = 10,
    cols = 60,
    placeholder = '',
    showLineNumbers = false,
    wrap = true,
    readOnly = false,
    isFocused = true,
    border = true,
  } = props;

  // Calculate available content width (inside border, minus line numbers)
  const lineNumberWidth = showLineNumbers ? 5 : 0; // "   1 " = 5 chars
  const borderWidth = border ? 2 : 0; // left + right border
  const contentWidth = Math.max(1, cols - borderWidth - lineNumberWidth);

  // Internal state
  const internalValue = signal(externalValue);
  const cursorRow = signal(0); // Logical row (actual line in text)
  const cursorCol = signal(0); // Logical column (position in actual line)
  const scrollOffset = signal(0); // Visual line scroll offset

  // Always use internal value for display (supports immediate updates)
  const currentValue = computed(() => internalValue.value);

  // Split text into logical lines (actual newlines)
  const logicalLines = computed(() => {
    const text = currentValue.value;
    return text ? text.split('\n') : [''];
  });

  // Wrap logical lines into visual lines for display
  // Each visual line tracks: { text, logicalRow, startCol }
  interface VisualLine {
    text: string;
    logicalRow: number;
    startCol: number;
  }

  const visualLines = computed((): VisualLine[] => {
    const logical = logicalLines.value;
    const result: VisualLine[] = [];

    for (let logicalRow = 0; logicalRow < logical.length; logicalRow++) {
      const line = logical[logicalRow];

      if (!wrap || line.length <= contentWidth) {
        // No wrapping needed - single visual line
        result.push({ text: line, logicalRow, startCol: 0 });
      } else {
        // Wrap long line into multiple visual lines
        let startCol = 0;
        while (startCol < line.length) {
          const chunk = line.slice(startCol, startCol + contentWidth);
          result.push({ text: chunk, logicalRow, startCol });
          startCol += contentWidth;
        }
        // Handle empty trailing chunk (cursor at end of wrapped line)
        if (line.length > 0 && line.length % contentWidth === 0) {
          result.push({ text: '', logicalRow, startCol: line.length });
        }
      }
    }

    return result;
  });

  // Find visual line index for current cursor position
  const cursorVisualRow = computed(() => {
    const visual = visualLines.value;
    const logRow = cursorRow.value;
    const logCol = cursorCol.value;

    for (let i = 0; i < visual.length; i++) {
      const vl = visual[i];
      if (vl.logicalRow === logRow) {
        // Check if cursor is in this visual line's range
        const endCol = vl.startCol + (vl.text.length || contentWidth);
        if (logCol >= vl.startCol && logCol < endCol) {
          return i;
        }
        // Cursor at end of line
        if (logCol === vl.startCol + vl.text.length && i + 1 < visual.length) {
          const next = visual[i + 1];
          if (next.logicalRow !== logRow) {
            return i; // Last visual line of this logical line
          }
        }
      }
    }
    // Fallback: find last visual line for this logical row
    for (let i = visual.length - 1; i >= 0; i--) {
      if (visual[i].logicalRow === logRow) return i;
    }
    return 0;
  });

  // Visible visual lines with scroll offset
  const visibleVisualLines = computed(() => {
    const all = visualLines.value;
    const start = scrollOffset.value;
    const end = Math.min(start + rows, all.length);
    return all.slice(start, end);
  });

  // Update cursor position constraints
  const constrainCursor = () => {
    const currentLines = logicalLines.value;
    const maxRow = Math.max(0, currentLines.length - 1);
    const currentRow = Math.min(cursorRow.value, maxRow);
    const currentLine = currentLines[currentRow] || '';
    const maxCol = currentLine.length;

    cursorRow.value = currentRow;
    cursorCol.value = Math.min(cursorCol.value, maxCol);

    // Auto-scroll to keep cursor visible (using visual lines)
    const visualRow = cursorVisualRow.value;
    if (visualRow < scrollOffset.value) {
      scrollOffset.value = visualRow;
    } else if (visualRow >= scrollOffset.value + rows) {
      scrollOffset.value = visualRow - rows + 1;
    }
  };

  // Insert text at cursor
  const insertText = (text: string) => {
    if (readOnly) return;

    const currentLines = logicalLines.value;
    const row = cursorRow.value;
    const col = cursorCol.value;
    const line = currentLines[row] || '';

    const newLine = line.slice(0, col) + text + line.slice(col);
    const newLines = [...currentLines];
    newLines[row] = newLine;

    const newValue = newLines.join('\n');

    // Use batch to update all signals atomically, preventing cascading re-renders
    batch(() => {
      internalValue.value = newValue;
      cursorCol.value = col + text.length;
    });
    constrainCursor();
  };

  // Delete character at cursor
  const deleteChar = (direction: 'forward' | 'backward') => {
    if (readOnly) return;

    const currentLines = [...logicalLines.value];
    const row = cursorRow.value;
    const col = cursorCol.value;
    const line = currentLines[row] || '';

    let newCol = col;
    let newRow = row;

    if (direction === 'backward') {
      if (col > 0) {
        // Delete character before cursor
        const newLine = line.slice(0, col - 1) + line.slice(col);
        currentLines[row] = newLine;
        newCol = col - 1;
      } else if (row > 0) {
        // Merge with previous line
        const prevLine = currentLines[row - 1];
        currentLines[row - 1] = prevLine + line;
        currentLines.splice(row, 1);
        newRow = row - 1;
        newCol = prevLine.length;
      }
    } else {
      // forward
      if (col < line.length) {
        // Delete character at cursor
        const newLine = line.slice(0, col) + line.slice(col + 1);
        currentLines[row] = newLine;
      } else if (row < currentLines.length - 1) {
        // Merge with next line
        const nextLine = currentLines[row + 1];
        currentLines[row] = line + nextLine;
        currentLines.splice(row + 1, 1);
      }
    }

    const newValue = currentLines.join('\n');

    // Use batch to update all signals atomically
    batch(() => {
      internalValue.value = newValue;
      cursorRow.value = newRow;
      cursorCol.value = newCol;
    });

    if (onChange) {
      onChange(newValue);
    }

    constrainCursor();
  };

  // Insert newline
  const insertNewline = () => {
    if (readOnly) return;

    const currentLines = [...logicalLines.value];
    const row = cursorRow.value;
    const col = cursorCol.value;
    const line = currentLines[row] || '';

    const beforeCursor = line.slice(0, col);
    const afterCursor = line.slice(col);

    currentLines[row] = beforeCursor;
    currentLines.splice(row + 1, 0, afterCursor);

    const newValue = currentLines.join('\n');

    // Use batch to update all signals atomically
    batch(() => {
      internalValue.value = newValue;
      cursorRow.value = row + 1;
      cursorCol.value = 0;
    });

    if (onChange) {
      onChange(newValue);
    }

    constrainCursor();
  };

  // Keyboard input handler
  // Use high priority (10) when focused to consume events before parent handlers
  useInput(
    (input, key) => {
      if (!isFocused || readOnly) return false;

      const currentLines = logicalLines.value;

      // Arrow keys - cursor movement
      if (key.upArrow) {
        if (cursorRow.value > 0) {
          cursorRow.value -= 1;
          constrainCursor();
        }
        return true; // consumed
      }
      if (key.downArrow) {
        if (cursorRow.value < currentLines.length - 1) {
          cursorRow.value += 1;
          constrainCursor();
        }
        return true; // consumed
      }
      if (key.leftArrow) {
        if (cursorCol.value > 0) {
          cursorCol.value -= 1;
        } else if (cursorRow.value > 0) {
          cursorRow.value -= 1;
          cursorCol.value = (currentLines[cursorRow.value] || '').length;
          constrainCursor();
        }
        return true; // consumed
      }
      if (key.rightArrow) {
        const currentLine = currentLines[cursorRow.value] || '';
        if (cursorCol.value < currentLine.length) {
          cursorCol.value += 1;
        } else if (cursorRow.value < currentLines.length - 1) {
          cursorRow.value += 1;
          cursorCol.value = 0;
          constrainCursor();
        }
        return true; // consumed
      }
      // Home/End
      if (key.home) {
        cursorCol.value = 0;
        return true; // consumed
      }
      if (key.end) {
        const currentLine = currentLines[cursorRow.value] || '';
        cursorCol.value = currentLine.length;
        return true; // consumed
      }
      // Page Up/Down
      if (key.pageUp) {
        cursorRow.value = Math.max(0, cursorRow.value - rows);
        constrainCursor();
        return true; // consumed
      }
      if (key.pageDown) {
        cursorRow.value = Math.min(currentLines.length - 1, cursorRow.value + rows);
        constrainCursor();
        return true; // consumed
      }
      // Backspace/Delete
      if (key.backspace || key.delete) {
        deleteChar(key.backspace ? 'backward' : 'forward');
        return true; // consumed
      }
      // Enter
      if (key.return) {
        insertNewline();
        return true; // consumed
      }
      // Regular text input (but not Tab - allow Tab for navigation)
      if (input && !key.ctrl && !key.meta && !key.tab) {
        insertText(input);
        return true; // consumed
      }

      return false; // not consumed, let other handlers process
    },
    { isActive: isFocused, priority: 10 },
  );

  // Render
  return (
    <Box
      style={{
        flexDirection: 'column',
        width: cols,
        height: rows + (border ? 2 : 0),
        borderStyle: border ? 'single' : undefined,
        borderColor: isFocused ? 'cyan' : 'gray',
        overflow: 'hidden',
      }}
    >
      {() => {
        const displayLines = visibleVisualLines.value;
        const isEmpty = currentValue.value === '';

        if (isEmpty && placeholder) {
          return <Text style={{ dim: true }}>{placeholder.slice(0, contentWidth)}</Text>;
        }

        return displayLines.map((vl, index) => {
          const visualIndex = scrollOffset.value + index;
          // Check if cursor is on this visual line
          const isCursorLine =
            vl.logicalRow === cursorRow.value &&
            cursorCol.value >= vl.startCol &&
            cursorCol.value <= vl.startCol + vl.text.length;

          // Line numbers show the logical row number (only on first visual line of each logical line)
          const isFirstVisualLine = vl.startCol === 0;
          const lineNumber = showLineNumbers
            ? isFirstVisualLine
              ? `${`${vl.logicalRow + 1}`.padStart(4, ' ')} `
              : '     ' // continuation lines get blank line number
            : '';

          // For cursor line, render with inline cursor highlight
          if (isCursorLine && isFocused) {
            const colInVisual = cursorCol.value - vl.startCol;
            const before = vl.text.slice(0, colInVisual);
            const cursorChar = vl.text[colInVisual] || ' ';
            const after = vl.text.slice(colInVisual + 1);

            return (
              <Text key={visualIndex}>
                {showLineNumbers && <Text style={{ dim: true }}>{lineNumber}</Text>}
                {before}
                <Text style={{ inverse: true }}>{cursorChar}</Text>
                {after}
              </Text>
            );
          }

          // Non-cursor rows
          return (
            <Text key={visualIndex}>
              {showLineNumbers && <Text style={{ dim: true }}>{lineNumber}</Text>}
              {vl.text || ' '}
            </Text>
          );
        });
      }}
    </Box>
  );
}

/**
 * Notepad App - Simple text editor
 */

import { Box, For, Text, TextInput, signal } from '@zen/tui';

export function Notepad() {
  const content = signal(`Welcome to ZenOS Notepad!

This is a simple text editor built with @zen/tui.

Features:
- Real-time text editing
- Multi-line support
- Reactive updates

Try typing below...`);

  const lineCount = () => content.value.split('\n').length;
  const charCount = () => content.value.length;

  return (
    <Box flexDirection="column" width="100%" height="100%">
      {/* Toolbar */}
      <Box backgroundColor="gray" paddingX={1} gap={2}>
        <Text color="white">File</Text>
        <Text color="white">Edit</Text>
        <Text color="white">View</Text>
        <Text color="white">Help</Text>
      </Box>

      {/* Editor Area */}
      <Box flex={1} backgroundColor="black" padding={1}>
        <Box flexDirection="column" width="100%">
          <For each={content.value.split('\n')}>
            {(line, index) => (
              <Box>
                <Text color="gray" dimColor>
                  {String(index() + 1).padStart(3, ' ')} │
                </Text>
                <Text color="white"> {line || ' '}</Text>
              </Box>
            )}
          </For>
        </Box>
      </Box>

      {/* Input Area */}
      <Box backgroundColor="black" borderStyle="single" borderTop borderColor="gray" padding={1}>
        <TextInput
          value={content.value}
          onChange={(v) => (content.value = v)}
          placeholder="Start typing..."
        />
      </Box>

      {/* Status Bar */}
      <Box backgroundColor="gray" paddingX={1} justifyContent="space-between">
        <Text color="white">Notepad</Text>
        <Text color="white">
          Lines: {lineCount} | Chars: {charCount}
        </Text>
      </Box>
    </Box>
  );
}

# @zen/tui-advanced

> Advanced components for professional TUI applications

**@zen/tui-advanced** provides advanced components for building full-screen terminal applications like file managers, IDEs, system monitors, and more.

## Installation

```bash
npm install @zen/tui @zen/tui-advanced
```

**Note:** Requires `@zen/tui` as peer dependency.

## What's Included

### Window Management
- **Window** - Floating windows with title bar, drag, resize, minimize, maximize
- **WindowManager** - Multi-window state management

### Layout
- **Splitter** - Resizable split panes (horizontal/vertical)
- **List** - General-purpose list component with selection
- **FullscreenLayout** - Alternate screen buffer for full-screen apps
- **ScrollBox** - Scrollable container with keyboard/mouse support

### Input
- **TextArea** - Multi-line text editor with cursor control
- **MenuBar** - Top menu bar with keyboard navigation

### Data Visualization
- **Chart** - Base chart component
- **LineChart** - Line chart for time series data
- **BarChart** - Bar chart for categorical data
- **SparkLine** - Mini inline chart

### Navigation
- **Tabs** - Tab navigation UI
- **Router** - Client-side routing
- **CommandPalette** - Fuzzy search command palette

### Data Display
- **TreeView** - Hierarchical tree structure
- **Markdown** - Markdown rendering in terminal
- **StatusBar** - Bottom status bar

### Interactive
- **Pressable** - Click/press interaction
- **Draggable** - Drag interaction
- **Hoverable** - Hover state tracking
- **ContextMenu** - Right-click context menu

## Usage

### Window Management

```tsx
import { Box, Text } from '@zen/tui';
import { Window, createWindow, closeWindow } from '@zen/tui-advanced';

function App() {
  const windowId = createWindow({
    title: 'Terminal',
    icon: '🖥️',
    x: 10,
    y: 5,
    width: 60,
    height: 20,
  });

  return (
    <Window windowId={windowId}>
      <Text>Window content</Text>
    </Window>
  );
}
```

### Split Panes

```tsx
import { Splitter, Pane } from '@zen/tui-advanced';

function FileManager() {
  return (
    <Splitter orientation="horizontal" sizes={[30, 70]}>
      <Pane minSize={20}>
        <FileTree />
      </Pane>
      <Pane>
        <FilePreview />
      </Pane>
    </Splitter>
  );
}
```

### Multi-line Text Editor

```tsx
import { TextArea } from '@zen/tui-advanced';

function Editor() {
  const content = signal('');

  return (
    <TextArea
      value={content}
      onChange={setContent}
      showLineNumbers={true}
      syntax="javascript"
    />
  );
}
```

### Menu Bar

```tsx
import { MenuBar, Menu, MenuItem } from '@zen/tui-advanced';

function App() {
  return (
    <Box flexDirection="column">
      <MenuBar>
        <Menu label="File" shortcut="F1">
          <MenuItem label="Open" shortcut="Ctrl+O" onSelect={handleOpen} />
          <MenuItem label="Save" shortcut="Ctrl+S" onSelect={handleSave} />
        </Menu>
        <Menu label="Edit" shortcut="F2">
          <MenuItem label="Copy" shortcut="Ctrl+C" onSelect={copy} />
          <MenuItem label="Paste" shortcut="Ctrl+V" onSelect={paste} />
        </Menu>
      </MenuBar>

      <Editor />
    </Box>
  );
}
```

## Examples

Check the [examples directory](../../examples) for complete applications:

- **tui-os-demo** - Desktop environment with window management
- **file-manager** - Ranger-like file manager with split panes
- **text-editor** - Vim-like text editor
- **system-monitor** - Htop-like system monitor with charts

## When to Use

Use `@zen/tui-advanced` when building:

- ✅ File managers (ranger, nnn)
- ✅ Text editors (vim, nano, micro)
- ✅ System monitors (htop, bottom)
- ✅ Git UIs (lazygit, tig)
- ✅ IDEs and code editors
- ✅ Email clients (mutt, aerc)
- ✅ Chat applications
- ✅ Dashboard applications
- ✅ Any full-screen TUI application

For simple CLI tools and prompts, use `@zen/tui` instead.

## Requirements

- Node.js 18+
- `@zen/tui` >= 0.0.0
- Terminal with:
  - 256 color support (recommended)
  - Mouse support (optional, for interactive features)
  - Unicode support (for proper emoji/character rendering)

## Performance

- **Fine-grained reactivity** - Only changed components re-render
- **Incremental layout** - Only affected regions recalculated
- **Virtual scrolling** - Large lists rendered efficiently
- **Signal-based** - No virtual DOM overhead

## License

MIT

---

**Built with ❤️ by the Zen Team**

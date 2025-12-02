/**
 * TUI Preview Component
 *
 * Uses xterm.js to render terminal output in the browser.
 * This allows previewing @zen/tui examples with ANSI styling.
 */

import { effect, signal } from '@zen/web';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';

interface TuiPreviewProps {
  /** ANSI-encoded terminal output to display (string or reactive function) */
  output: string | (() => string);
  /** Terminal width in columns */
  cols?: number;
  /** Terminal height in rows */
  rows?: number;
}

export function TuiPreview(props: TuiPreviewProps) {
  const { output, cols = 80, rows = 24 } = props;

  // Resolve output - handle both string and function
  const getOutput = () => (typeof output === 'function' ? output() : output);

  let terminal: Terminal | null = null;
  let fitAddon: FitAddon | null = null;

  const initTerminal = (container: HTMLDivElement) => {
    if (terminal) return;

    terminal = new Terminal({
      cols,
      rows,
      theme: {
        background: '#1a1b26',
        foreground: '#c0caf5',
        cursor: '#c0caf5',
        cursorAccent: '#1a1b26',
        selectionBackground: '#33467c',
        black: '#15161e',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#bb9af7',
        cyan: '#7dcfff',
        white: '#a9b1d6',
        brightBlack: '#414868',
        brightRed: '#f7768e',
        brightGreen: '#9ece6a',
        brightYellow: '#e0af68',
        brightBlue: '#7aa2f7',
        brightMagenta: '#bb9af7',
        brightCyan: '#7dcfff',
        brightWhite: '#c0caf5',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: false,
      cursorStyle: 'block',
      allowTransparency: true,
      scrollback: 0,
      disableStdin: true,
    });

    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(container);

    // Write the initial ANSI output
    const initialOutput = getOutput();
    if (initialOutput) {
      terminal.write(initialOutput);
    }
  };

  // Update output when it changes (for reactive output)
  effect(() => {
    const currentOutput = getOutput();
    if (terminal && currentOutput) {
      terminal.clear();
      terminal.write(currentOutput);
    }
  });

  return (
    <div
      class="tui-preview rounded-lg overflow-hidden"
      style={{
        backgroundColor: '#1a1b26',
        padding: '12px',
        minHeight: `${(rows + 1) * 18}px`,
      }}
    >
      <div
        ref={(el) => {
          if (el) {
            initTerminal(el as HTMLDivElement);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

/**
 * Helper to create colored text using ANSI codes
 */
export const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright foreground
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

/**
 * Pre-rendered TUI examples
 * These are static ANSI strings that demonstrate what @zen/tui can produce
 */
export const tuiExamples = {
  // Simple box with title
  box: `
${ansi.cyan}┌─────────────────────────────────┐${ansi.reset}
${ansi.cyan}│${ansi.reset} ${ansi.bold}${ansi.white}Welcome to @zen/tui${ansi.reset}            ${ansi.cyan}│${ansi.reset}
${ansi.cyan}│${ansi.reset}                                 ${ansi.cyan}│${ansi.reset}
${ansi.cyan}│${ansi.reset}  Build beautiful CLI apps with  ${ansi.cyan}│${ansi.reset}
${ansi.cyan}│${ansi.reset}  reactive components and JSX.   ${ansi.cyan}│${ansi.reset}
${ansi.cyan}│${ansi.reset}                                 ${ansi.cyan}│${ansi.reset}
${ansi.cyan}└─────────────────────────────────┘${ansi.reset}
`,

  // Progress bar
  progressBar: `
${ansi.bold}${ansi.white}Downloading packages...${ansi.reset}

${ansi.green}████████████████████${ansi.brightBlack}░░░░░░░░░░${ansi.reset} ${ansi.yellow}67%${ansi.reset}

${ansi.dim}lodash        ${ansi.green}✓${ansi.reset}
${ansi.dim}react         ${ansi.green}✓${ansi.reset}
${ansi.dim}typescript    ${ansi.cyan}↓${ansi.reset}
${ansi.dim}vite          ${ansi.brightBlack}...${ansi.reset}
`,

  // Interactive menu
  menu: `
${ansi.bold}${ansi.magenta}? ${ansi.white}Select a framework${ansi.reset}

${ansi.cyan}❯${ansi.reset} ${ansi.cyan}${ansi.bold}Zen${ansi.reset}       ${ansi.dim}Ultra-fast reactive framework${ansi.reset}
  React     ${ansi.dim}Component-based UI library${ansi.reset}
  Vue       ${ansi.dim}Progressive framework${ansi.reset}
  Solid     ${ansi.dim}Fine-grained reactivity${ansi.reset}
  Svelte    ${ansi.dim}Compiler-based approach${ansi.reset}

${ansi.dim}↑/↓ to move, Enter to select, Esc to cancel${ansi.reset}
`,

  // Dashboard layout
  dashboard: `
${ansi.bgBlue}${ansi.white}${ansi.bold}                    ZEN DASHBOARD                    ${ansi.reset}

${ansi.cyan}┌─ System ──────────────┐${ansi.reset} ${ansi.magenta}┌─ Network ─────────────┐${ansi.reset}
${ansi.cyan}│${ansi.reset} CPU:  ${ansi.green}████${ansi.brightBlack}░░${ansi.reset} ${ansi.yellow}42%${ansi.reset}     ${ansi.cyan}│${ansi.reset} ${ansi.magenta}│${ansi.reset} ↑ ${ansi.green}2.4 MB/s${ansi.reset}           ${ansi.magenta}│${ansi.reset}
${ansi.cyan}│${ansi.reset} RAM:  ${ansi.yellow}██████${ansi.brightBlack}░${ansi.reset} ${ansi.yellow}78%${ansi.reset}    ${ansi.cyan}│${ansi.reset} ${ansi.magenta}│${ansi.reset} ↓ ${ansi.cyan}892 KB/s${ansi.reset}           ${ansi.magenta}│${ansi.reset}
${ansi.cyan}│${ansi.reset} Disk: ${ansi.green}███${ansi.brightBlack}░░░${ansi.reset} ${ansi.green}34%${ansi.reset}     ${ansi.cyan}│${ansi.reset} ${ansi.magenta}│${ansi.reset} Latency: ${ansi.green}12ms${ansi.reset}       ${ansi.magenta}│${ansi.reset}
${ansi.cyan}└────────────────────────┘${ansi.reset} ${ansi.magenta}└────────────────────────┘${ansi.reset}

${ansi.yellow}┌─ Recent Activity ─────────────────────────────────┐${ansi.reset}
${ansi.yellow}│${ansi.reset} ${ansi.green}✓${ansi.reset} Build completed successfully         ${ansi.dim}2m ago${ansi.reset}  ${ansi.yellow}│${ansi.reset}
${ansi.yellow}│${ansi.reset} ${ansi.cyan}→${ansi.reset} Deploying to production...          ${ansi.dim}now${ansi.reset}    ${ansi.yellow}│${ansi.reset}
${ansi.yellow}│${ansi.reset} ${ansi.green}✓${ansi.reset} Tests passed (142/142)              ${ansi.dim}5m ago${ansi.reset}  ${ansi.yellow}│${ansi.reset}
${ansi.yellow}└────────────────────────────────────────────────────┘${ansi.reset}
`,
};

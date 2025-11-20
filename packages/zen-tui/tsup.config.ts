import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'jsx-runtime': 'src/jsx-runtime.ts',
  },
  format: ['esm'],
  // DTS disabled: tsconfig's jsxImportSource creates circular resolution during DTS build
  // Types are still available through workspace TypeScript resolution
  dts: false,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  outDir: 'dist',
  treeshake: true,
  external: [
    '@zen/runtime',
    '@zen/signal',
    '@zen/tui/jsx-runtime',
    'chalk',
    'cli-boxes',
    'string-width',
    'strip-ansi',
  ],
});

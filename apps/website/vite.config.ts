import zenCompiler from '@zen/compiler';
// import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    zenCompiler(),
    // Icons plugin disabled - requires @svgr/core dependency
    // Icons({
    //   compiler: 'jsx',
    //   jsx: 'react',
    //   defaultClass: 'icon',
    // }),
  ],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@zen/web',
  },
});

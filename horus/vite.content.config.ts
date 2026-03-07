import { defineConfig } from 'vite';
import { resolve } from 'path';

// Build 2: content script as a self-contained IIFE.
// Chrome content scripts do NOT support ES module imports — all dependencies
// must be bundled into a single file. IIFE format achieves this automatically.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // preserve the ES module build output
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
      },
    },
    sourcemap: true,
    target: 'chrome120',
    minify: false,
  },
});

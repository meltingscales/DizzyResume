import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

/// Copy static extension files (manifest, popup HTML) into dist after build.
function copyExtensionFiles(): Plugin {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      const files = ['manifest.json', 'src/popup/popup.html'];
      for (const file of files) {
        const dest = `dist/${file.replace('src/popup/', '')}`;
        mkdirSync('dist', { recursive: true });
        copyFileSync(file, dest);
      }
      if (existsSync('icons')) {
        mkdirSync('dist/icons', { recursive: true });
      }
    },
  };
}

// Build 1: background service worker + popup as ES modules (support ES imports natively)
export default defineConfig({
  plugins: [copyExtensionFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        popup: resolve(__dirname, 'src/popup/popup.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        format: 'es',
      },
    },
    sourcemap: true,
    target: 'chrome120',
    minify: false,
  },
});

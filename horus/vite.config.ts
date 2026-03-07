import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

/// Copy static extension files (manifest, popup HTML, icons) into dist after build.
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
      // Copy icons if they exist
      if (existsSync('icons')) {
        mkdirSync('dist/icons', { recursive: true });
        // Icons are copied by the build; for now just note their location
      }
    },
  };
}

export default defineConfig({
  plugins: [copyExtensionFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
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

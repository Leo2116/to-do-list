import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'frontend'),
  base: './',
  server: {
    open: true,
    port: 5173,
    proxy: {
      '/retos': 'http://127.0.0.1:5000'
    }
  },
  preview: {
    port: 4173
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true
  }
});

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
  },
  base: './', // Dies hilft, relative Pfade zu verwenden
});

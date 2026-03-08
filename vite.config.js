/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './Test/setupTests.js',
    include: ['Test/**/*.{test,spec}.{js,jsx}'],
  },
  publicDir: "public",
  server: {
    port: 3000,
    host: true  // listen on 0.0.0.0 so Safari and other browsers can connect
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  esbuild: {
    loader: 'jsx',
    include: /(src|Test)\/.*\.jsx?$/,
    exclude: []
  }
});

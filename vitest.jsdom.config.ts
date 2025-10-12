import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'jsdom',
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/test/Modal.test.ts',
      'src/test/Sidebar.test.ts'
    ],
  },
  resolve: {
    alias: {
      '$lib': '/src/lib'
    }
  }
});

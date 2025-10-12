import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/lib/test/**/*.spec.ts',
      'src/test/setupWizardStore.test.ts',
      'src/lib/stores/__tests__/**/*.{test,spec}.ts',
      'src/test/agentStore.test.ts'
    ],
  },
  resolve: {
    alias: {
      '$lib': '/src/lib'
    }
  }
});

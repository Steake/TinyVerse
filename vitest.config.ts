import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  // Use project-based config to avoid initializing jsdom for node-only tests
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    projects: [
      {
        test: {
          environment: 'node',
          globalSetup: ['./src/test/globalSetup.ts'],
          setupFiles: ['./src/test/setup.ts'],
          include: [
            'src/lib/test/**/*.spec.ts',
            'src/test/setupWizardStore.test.ts',
            'src/lib/stores/__tests__/**/*.{test,spec}.ts',
            'src/test/agentStore.test.ts'
          ]
        }
      },
      {
        test: {
          environment: 'jsdom',
          globalSetup: ['./src/test/globalSetup.ts'],
          setupFiles: ['./src/test/setup.ts'],
          include: [
            'src/test/Modal.test.ts',
            'src/test/Sidebar.test.ts'
          ]
        }
      }
    ]
  },
  resolve: {
    alias: {
      '$lib': '/src/lib'
    }
  }
});

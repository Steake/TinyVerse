import { defineConfig, devices } from '@playwright/test';

const tinytroupeMockFlag = process.env.USE_TINYTROUPE_MOCK ?? '0';
const uvicornReloadFlag = process.env.UVICORN_RELOAD ?? '0';
const tinytroupeMaxTokens = process.env.TINYTROUPE_MAX_TOKENS ?? '8192';
const backendStartCommand = `cd backend && UVICORN_RELOAD=${uvicornReloadFlag} TINYTROUPE_MAX_TOKENS=${tinytroupeMaxTokens} USE_TINYTROUPE_MOCK=${tinytroupeMockFlag} bash start.sh`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially for simulation tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for simulation tests
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: backendStartCommand,
      url: 'http://localhost:8000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});

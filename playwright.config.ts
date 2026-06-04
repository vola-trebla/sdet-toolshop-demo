import { defineConfig, devices } from '@playwright/test';
import { config } from './src/utils/config';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  // Every test is isolated and parallel-safe (see research: Parallel Execution).
  fullyParallel: true,

  // Never let a stray test.only reach CI.
  forbidOnly: !!process.env.CI,

  // Retries reveal flakiness on CI; they do not exist to hide it (see Flakiness Policy).
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Local: rich HTML report. CI: blob report so shards can be merged.
  reporter: process.env.CI ? [['blob'], ['github']] : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: config.webBaseUrl,
    // Toolshop tags elements with data-test, not the default data-testid.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'web',
      testDir: './tests/web',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // API tests need no browser; they drive Playwright's request context.
      name: 'api',
      testDir: './tests/api',
    },
  ],
});

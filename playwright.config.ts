import { defineConfig, devices } from '@playwright/test';
const baseURL = 'http://127.0.0.1:4173';
export default defineConfig({
 testDir: './tests', fullyParallel: true, forbidOnly: !!process.env.CI,
 retries: process.env.CI ? 1 : 0, workers: process.env.CI ? 2 : 4,
 timeout: 30000, expect: { timeout: 5000 },
 reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
 use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
 webServer: { command: 'npm start', url: `${baseURL}/health`, reuseExistingServer: false, timeout: 30000 },
 projects: [
  { name: 'api', testMatch: '**/*.api.spec.ts' },
  { name: 'chromium', testMatch: '**/*.ui.spec.ts', use: { ...devices['Desktop Chrome'] } },
  { name: 'chrome', testMatch: '**/*.ui.spec.ts', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  { name: 'edge', testMatch: '**/*.ui.spec.ts', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  { name: 'firefox', testMatch: '**/*.ui.spec.ts', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', testMatch: '**/*.ui.spec.ts', use: { ...devices['Desktop Safari'] } },
  { name: 'mobile', testMatch: '**/*.ui.spec.ts', use: { ...devices['Pixel 7'] } }
 ]
});

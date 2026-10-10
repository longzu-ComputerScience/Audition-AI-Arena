import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 120_000, expect: { timeout: 15_000 },
  fullyParallel: false, workers: 1, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3000', channel: 'chrome', reducedMotion: 'reduce', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: {width:1280,height:900} } },
    { name: 'mobile', testMatch: /journey.spec.ts/, use: { ...devices['iPhone 13'], defaultBrowserType:'chromium' } },
  ],
  webServer: { command:'npm run dev', url:'http://127.0.0.1:3000', reuseExistingServer:true, timeout:60_000 },
});

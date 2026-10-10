import { defineConfig, devices } from '@playwright/test';
const baseURL=process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
export default defineConfig({
  testDir: './tests/browser', timeout: 120_000, expect: { timeout: 15_000 },
  fullyParallel: false, workers: 1, reporter: 'list',
  use: { baseURL, channel: 'chrome', reducedMotion: 'reduce', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: {width:1280,height:900} } },
    { name: 'laptop-motion', testMatch: /(journey|stability).spec.ts/, use: { ...devices['Desktop Chrome'], viewport:{width:1366,height:768}, reducedMotion:'no-preference' } },
    { name: 'mobile', testMatch: /(journey|stability).spec.ts/, use: { ...devices['iPhone 13'], defaultBrowserType:'chromium', reducedMotion:'no-preference' } },
  ],
  webServer: { command:'npm run dev', url:baseURL, reuseExistingServer:true, timeout:60_000 },
});

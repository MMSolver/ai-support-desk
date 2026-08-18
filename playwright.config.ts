import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config (PROJECT.md §21/§22). Runs against a production
 * build (`next build && next start`) rather than `next dev`, per Next.js's
 * own testing guide — closer to real deployed behavior.
 *
 * These tests exercise the real Supabase DB and real OpenAI API (see
 * `.env.local`) — there's no separate test project configured, matching
 * PROJECT.md §22's "mevcut DB'de test prefix'li kayitlar" approach. Every
 * ticket these tests create is subject-prefixed with "[E2E]" (see
 * `e2e/fixtures/test-data.ts`) so it's identifiable in the real DB.
 *
 * Chromium only, matching §22's stated CI baseline ("CI'da: headless
 * Chromium") — running the same AI-calling flows across three engines would
 * triple both runtime and OpenAI cost for no meaningful coverage gain in
 * this MVP.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Ticket creation tests hit real, rate-limited APIs.
  retries: 0,
  reporter: 'list',
  // The ticket-creation test's own `waitForURL(..., { timeout: 30_000 })`
  // needs real headroom under the real OpenAI/Supabase round trip it
  // triggers (up to ~21s worst case: a 10s AI request timeout + a 1s
  // rate-limit retry delay + a second 10s request, per
  // src/lib/ai/openai.ts) — a global test timeout equal to that inner wait
  // would have already killed the test before it could honor it.
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

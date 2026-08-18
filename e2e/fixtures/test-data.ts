/**
 * Test data helpers for the E2E suite (PROJECT.md §22). These tests run
 * against the real Supabase DB (no separate test project configured), so
 * every subject is prefixed with "[E2E]" plus a unique suffix — easy to
 * identify and never collides with real data or other test runs.
 */
export function uniqueSubject(label: string): string {
  return `[E2E] ${label} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const VALID_TICKET_MESSAGE =
  'I have been locked out of my account since yesterday morning and none of my password reset emails are arriving. This is blocking my whole team from accessing our billing dashboard.';

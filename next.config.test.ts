import { describe, expect, it } from 'vitest';

import { buildContentSecurityPolicy } from './next.config';

// Regression test for the dev-mode CSP `eval` error (PROJECT.md §18): React
// uses `eval` in development to reconstruct server-side error stacks in the
// browser, so `script-src` must allow `'unsafe-eval'` there — but never in
// production, where neither React nor Next.js use `eval` by default.
// See node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
// ("Development vs Production Considerations").
describe('buildContentSecurityPolicy', () => {
  it('allows unsafe-eval in script-src during development', () => {
    const csp = buildContentSecurityPolicy(true);
    expect(csp).toMatch(/script-src[^;]*'unsafe-eval'/);
  });

  it('never allows unsafe-eval in script-src in production', () => {
    const csp = buildContentSecurityPolicy(false);
    expect(csp).not.toContain('unsafe-eval');
  });
});

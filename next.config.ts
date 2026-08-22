import type { NextConfig } from 'next';

/**
 * Builds the `Content-Security-Policy` header value (PROJECT.md §18).
 *
 * The CSP is intentionally permissive on `script-src`/`style-src`
 * (`'unsafe-inline'`) rather than nonce-based: Next's App Router injects its
 * own inline bootstrap/flight-data `<script>` tags, and a few components
 * here set inline `style` attributes directly (e.g. the dashboard's 7-day
 * trend bar heights in `stats-cards.tsx`) — both would be silently broken by
 * a stricter policy without also wiring up nonces via middleware, which is
 * out of scope for this MVP. `connect-src 'self'` is safe to keep strict:
 * the browser only ever calls this app's own `/api/*` routes — the OpenAI
 * and Supabase service-role calls happen server-side only (PROJECT.md §11,
 * `src/lib/db/supabase-admin.ts`), never from client-side `fetch`.
 *
 * `script-src` additionally allows `'unsafe-eval'` in development only:
 * React uses `eval` there to reconstruct server-side error stacks in the
 * browser (see `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`,
 * "Development vs Production Considerations"). Neither React nor Next.js use
 * `eval` in production, so it must never appear in the production header.
 * Exported for `next.config.test.ts` — this module itself isn't imported by
 * app code, so the CSP string has no other test surface.
 */
export function buildContentSecurityPolicy(isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

function buildSecurityHeaders() {
  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Content-Security-Policy',
      value: buildContentSecurityPolicy(process.env.NODE_ENV === 'development'),
    },
  ];
}

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: buildSecurityHeaders() }];
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

/**
 * Baseline HTTP security headers (PROJECT.md §18) applied to every response.
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
 */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

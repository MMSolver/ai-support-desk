import 'server-only';

/**
 * Basic in-memory rate limiting for the ticket-creation endpoint
 * (PROJECT.md §18: "AI endpoint'inde basit in-memory rate check (IP basina
 * dakikada max 10 istek)").
 *
 * This is explicitly an MVP-level measure, per the same section: it only
 * limits requests within a single server instance's memory, so it does
 * nothing across multiple serverless instances/regions. PROJECT.md names
 * the production upgrade path itself ("Vercel'in Edge Middleware + Upstash
 * Redis ile upgrade edilebilir") — swapping this module's implementation
 * for a shared-store limiter later doesn't require touching call sites,
 * since they only depend on {@link checkRateLimit}'s return shape.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
// Caps memory growth from an unbounded stream of distinct IPs — sweeps
// expired buckets before growing further rather than letting the map grow
// forever.
const MAX_TRACKED_KEYS = 5_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Present only when `allowed` is false. */
  retryAfterSeconds?: number;
}

/**
 * Fixed-window rate check for `key` (typically a client IP). Not
 * thread-contended — Node.js Route Handlers execute this synchronously
 * per-request, so there's no race between the read and the increment below.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();

  if (buckets.size >= MAX_TRACKED_KEYS) {
    sweepExpired(now);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/**
 * Best-effort client IP from standard proxy headers (Vercel populates
 * `x-forwarded-for`; Next's `NextRequest` has no built-in `.ip` to fall back
 * on). Requests where neither header is present all share one bucket —
 * an acceptable MVP degradation, not a bypass, since they're still limited
 * collectively rather than unlimited.
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return headers.get('x-real-ip') ?? 'unknown';
}

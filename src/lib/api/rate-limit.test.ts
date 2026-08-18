import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkRateLimit, getClientIp } from './rate-limit';

/**
 * Unit tests for the in-memory rate limiter (PROJECT.md §18). Each test uses
 * a unique key so they don't share bucket state with each other; real time
 * is faked so the window-expiry test doesn't need to actually sleep 60s.
 */
describe('checkRateLimit', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows the first request for a fresh key', () => {
    expect(checkRateLimit('key-a').allowed).toBe(true);
  });

  it('allows up to 10 requests, then blocks the 11th', () => {
    for (let i = 0; i < 10; i += 1) {
      expect(checkRateLimit('key-b').allowed).toBe(true);
    }
    const result = checkRateLimit('key-b');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks distinct keys independently', () => {
    for (let i = 0; i < 10; i += 1) {
      checkRateLimit('key-c');
    }
    expect(checkRateLimit('key-c').allowed).toBe(false);
    // A different key has its own budget, unaffected by key-c's.
    expect(checkRateLimit('key-d').allowed).toBe(true);
  });

  it('resets the window after it elapses', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 10; i += 1) {
      checkRateLimit('key-e');
    }
    expect(checkRateLimit('key-e').allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(checkRateLimit('key-e').allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('reads the first address from x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' });
    expect(getClientIp(headers)).toBe('203.0.113.5');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const headers = new Headers({ 'x-real-ip': '203.0.113.9' });
    expect(getClientIp(headers)).toBe('203.0.113.9');
  });

  it('falls back to "unknown" when neither header is present', () => {
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});

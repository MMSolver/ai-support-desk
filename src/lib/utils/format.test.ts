import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime, truncate } from './format';

describe('formatDate', () => {
  it('formats an ISO timestamp as month/day/year', () => {
    expect(formatDate('2026-08-18T00:00:00.000Z')).toBe('Aug 18, 2026');
  });
});

describe('formatDateTime', () => {
  it('formats an ISO timestamp with time', () => {
    // Intl.DateTimeFormat renders in the local timezone; assert on the parts
    // that don't depend on it (date components and the presence of a time).
    const result = formatDateTime('2026-08-18T15:45:00.000Z');
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
  });
});

describe('truncate', () => {
  it('returns the original string when under the limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns the original string when exactly at the limit', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and appends an ellipsis when over the limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('trims trailing whitespace before appending the ellipsis', () => {
    expect(truncate('hello  world', 6)).toBe('hello…');
  });
});

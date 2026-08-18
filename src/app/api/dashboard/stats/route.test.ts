import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDashboardStats } from '@/lib/db/queries';
import type { DashboardStats } from '@/types';

import { GET } from './route';

vi.mock('@/lib/db/queries', () => ({
  getDashboardStats: vi.fn(),
}));

const stats: DashboardStats = {
  totalTickets: 3,
  byPriority: { low: 0, medium: 1, high: 2, urgent: 0 },
  byCategory: { billing: 1, technical: 1, account: 1, product: 0, general: 0 },
  byStatus: { open: 2, in_progress: 0, resolved: 1, closed: 0, needs_review: 0, processing: 0 },
  last7DaysTrend: [{ date: '2026-08-18', count: 3 }],
};

beforeEach(() => {
  vi.mocked(getDashboardStats).mockReset();
});

describe('GET /api/dashboard/stats', () => {
  it('returns aggregate stats', async () => {
    vi.mocked(getDashboardStats).mockResolvedValue(stats);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ success: true, data: { totalTickets: 3 } });
  });

  it('returns 500 INTERNAL_ERROR when the DB call fails', async () => {
    vi.mocked(getDashboardStats).mockRejectedValue(new Error('db unavailable'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });
});

import { apiError, apiSuccess } from '@/lib/api/response';
import { getDashboardStats } from '@/lib/db/queries';

/**
 * Aggregate dashboard stats (PROJECT.md §9): totals, per-priority /
 * per-category / per-status breakdowns, and a 7-day creation trend.
 */
export async function GET() {
  try {
    const stats = await getDashboardStats();
    return apiSuccess(stats, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return apiError('INTERNAL_ERROR', 'Failed to fetch dashboard stats.', { status: 500 });
  }
}

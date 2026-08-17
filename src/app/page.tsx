import Link from 'next/link';

import { RecentTickets } from '@/components/dashboard/recent-tickets';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { getDashboardStats, listTickets } from '@/lib/db/queries';

const RECENT_TICKETS_LIMIT = 5;

// Fetches live ticket data on every request (PROJECT.md §8: "Server
// Component ile SSR"). Without this, Next.js would try to prerender the
// page once at build time — executing these DB calls before deploy-time
// env vars even exist — and freeze that snapshot instead of serving fresh
// data per request.
export const dynamic = 'force-dynamic';

/** Dashboard: stats + recent tickets (PROJECT.md §8/§26). */
export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    listTickets({ page: 1, limit: RECENT_TICKETS_LIMIT }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Dashboard"
        description="An overview of incoming support tickets and their AI analysis."
        action={<Button render={<Link href="/tickets/new" />}>New Ticket</Button>}
      />
      <StatsCards stats={stats} />
      <RecentTickets tickets={recent.data} />
    </div>
  );
}

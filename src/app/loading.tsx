import Link from 'next/link';

import { StatsCardsSkeleton, TicketListSkeleton } from '@/components/shared/loading-skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Dashboard instant loading state (PROJECT.md §16). */
export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Dashboard"
        description="An overview of incoming support tickets and their AI analysis."
        action={
          <Link href="/tickets/new" className={buttonVariants()}>
            New Ticket
          </Link>
        }
      />
      <StatsCardsSkeleton />
      <Card>
        <CardHeader>
          <CardTitle>Recent tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketListSkeleton count={3} />
        </CardContent>
      </Card>
    </div>
  );
}

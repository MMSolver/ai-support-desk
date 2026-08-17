import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { TicketCard } from '@/components/tickets/ticket-card';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Ticket } from '@/types';

/** Compact "recent tickets" list for the dashboard (PROJECT.md §8/§16/§26). */
export function RecentTickets({ tickets }: { tickets: Ticket[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tickets.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description="Create your first ticket to see it here."
            action={
              <Link href="/tickets/new" className={buttonVariants({ size: 'sm' })}>
                Create your first ticket
              </Link>
            }
          />
        ) : (
          tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        )}
      </CardContent>
    </Card>
  );
}

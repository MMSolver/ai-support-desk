import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketCard } from '@/components/tickets/ticket-card';
import type { Ticket } from '@/types';

/** Compact "recent tickets" list for the dashboard (PROJECT.md §8/§26). */
export function RecentTickets({ tickets }: { tickets: Ticket[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tickets.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tickets yet.</p>
        ) : (
          tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        )}
      </CardContent>
    </Card>
  );
}

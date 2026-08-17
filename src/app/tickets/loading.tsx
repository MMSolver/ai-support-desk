import Link from 'next/link';

import { TicketListSkeleton } from '@/components/shared/loading-skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { TicketFilters } from '@/components/tickets/ticket-filters';
import { buttonVariants } from '@/components/ui/button';

/** Ticket list instant loading state (PROJECT.md §16). */
export default function TicketsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Tickets"
        action={
          <Link href="/tickets/new" className={buttonVariants()}>
            New Ticket
          </Link>
        }
      />
      <TicketFilters />
      <TicketListSkeleton />
    </div>
  );
}

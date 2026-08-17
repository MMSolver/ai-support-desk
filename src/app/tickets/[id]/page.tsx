import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/shared/page-header';
import { TicketDetail } from '@/components/tickets/ticket-detail';
import { getTicketById } from '@/lib/db/queries';
import { ticketIdSchema } from '@/lib/validations/ticket';

// See src/app/page.tsx for why this is forced rather than left to Next's
// static-by-default heuristic — a ticket also must never serve a stale
// cached snapshot right after creation (PROJECT.md §13 step 11 redirects
// here immediately after the ticket is saved).
export const dynamic = 'force-dynamic';

/** Ticket detail page (PROJECT.md §8/§16/§26). */
export default async function TicketDetailPage(props: PageProps<'/tickets/[id]'>) {
  const { id } = await props.params;

  const parsedId = ticketIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  const ticket = await getTicketById(parsedId.data);
  if (!ticket) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Ticket"
        description={
          <Link href="/tickets" className="hover:underline">
            ← Back to tickets
          </Link>
        }
      />
      <TicketDetail ticket={ticket} />
    </div>
  );
}

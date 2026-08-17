import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import { TicketCard } from '@/components/tickets/ticket-card';
import { TicketFilters } from '@/components/tickets/ticket-filters';
import { Button } from '@/components/ui/button';
import { listTickets } from '@/lib/db/queries';
import { listTicketsSchema, type ListTicketsQuery } from '@/lib/validations/ticket';

function buildTicketsHref(filters: ListTicketsQuery, page: number): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.category) params.set('category', filters.category);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/tickets?${query}` : '/tickets';
}

// See src/app/page.tsx for why this is forced rather than left to Next's
// static-by-default heuristic.
export const dynamic = 'force-dynamic';

/** Filtered, paginated ticket list (PROJECT.md §8/§9/§26). */
export default async function TicketsPage(props: PageProps<'/tickets'>) {
  const rawSearchParams = await props.searchParams;

  // Unlike the API route, a bad/garbled query string here just falls back
  // to defaults instead of erroring — this is a page, not an endpoint.
  const parsedQuery = listTicketsSchema.safeParse({
    status: rawSearchParams.status,
    priority: rawSearchParams.priority,
    category: rawSearchParams.category,
    page: rawSearchParams.page,
    limit: rawSearchParams.limit,
  });
  const filters = parsedQuery.success ? parsedQuery.data : { page: 1, limit: 10 };

  const result = await listTickets(filters);
  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
  const hasFilters = Boolean(filters.status || filters.priority || filters.category);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Tickets"
        description={`${result.total} ticket${result.total === 1 ? '' : 's'} total`}
        action={<Button render={<Link href="/tickets/new" />}>New Ticket</Button>}
      />

      <TicketFilters />

      {result.data.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {hasFilters ? 'No tickets match your filters.' : 'No tickets yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {result.data.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          {filters.page > 1 ? (
            <Link href={buildTicketsHref(filters, filters.page - 1)} className="hover:underline">
              ← Previous
            </Link>
          ) : (
            <span className="text-muted-foreground/50">← Previous</span>
          )}
          <span className="text-muted-foreground">
            Page {filters.page} of {totalPages}
          </span>
          {filters.page < totalPages ? (
            <Link href={buildTicketsHref(filters, filters.page + 1)} className="hover:underline">
              Next →
            </Link>
          ) : (
            <span className="text-muted-foreground/50">Next →</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

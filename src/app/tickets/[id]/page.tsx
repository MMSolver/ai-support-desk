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

/**
 * Ticket detail page (PROJECT.md §8/§16/§26).
 *
 * Deliberately has no sibling `loading.tsx`, and PROJECT.md §16's "Ticket
 * detay: Skeleton layout" is not implemented here for that reason: any
 * ancestor `loading.tsx` (app/loading.tsx, app/tickets/loading.tsx — both
 * genuinely useful for their own routes, which never call `notFound()`)
 * wraps this segment in a Suspense boundary too. Once that boundary's
 * fallback flushes, the response has already started streaming a 200, so
 * `notFound()` below can no longer change the status — it degrades to a
 * "soft 404" (200 + `noindex`, correct UI, wrong status code). Confirmed
 * empirically: removing every loading.tsx in the tree restores a real 404;
 * restoring any one of them (even several levels up) brings the soft-404
 * back. This is documented, expected Next.js behavior, not a bug —
 * see node_modules/next/dist/docs/.../file-conventions/loading.md
 * ("Status Codes" / "When is the response body streamed?"). Fixing it for
 * real would mean pulling this route into its own route-group root layout
 * so it shares no ancestor Suspense boundary with `/` or `/tickets` — out
 * of scope for this pass; flagged for a future phase if it matters.
 */
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

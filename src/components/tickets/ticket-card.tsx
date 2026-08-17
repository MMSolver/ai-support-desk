import Link from 'next/link';

import { CategoryBadge } from '@/components/shared/category-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate, truncate } from '@/lib/utils/format';
import type { Ticket } from '@/types';

/**
 * Compact per-ticket summary (PROJECT.md §8). Reused by both the dashboard's
 * recent-tickets list and the full tickets list page.
 */
export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="border-border hover:bg-muted/50 flex flex-col gap-2 rounded-lg border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium">{ticket.subject}</p>
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {truncate(ticket.message, 140)}
          </p>
        </div>
        <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
          {formatDate(ticket.createdAt)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={ticket.status} />
        {ticket.aiPriority ? <PriorityBadge priority={ticket.aiPriority} /> : null}
        {ticket.aiCategory ? <CategoryBadge category={ticket.aiCategory} /> : null}
        {ticket.customerName ? (
          <span className="text-muted-foreground ml-auto text-xs">{ticket.customerName}</span>
        ) : null}
      </div>
    </Link>
  );
}

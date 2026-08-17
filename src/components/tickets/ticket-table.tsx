import Link from 'next/link';

import { CategoryBadge } from '@/components/shared/category-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils/format';
import type { Ticket } from '@/types';

/**
 * Desktop table view of the ticket list — the `md:` sibling of TicketCard
 * (PROJECT.md §20: "Ticket listesi: Card gorunumu (mobile) / Tablo gorunumu
 * (desktop)"). The subject cell is the row's link; native `<tr>` can't
 * carry an `href` itself.
 */
export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="max-w-64 font-medium">
              <Link href={`/tickets/${ticket.id}`} className="block truncate hover:underline">
                {ticket.subject}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{ticket.customerName || '—'}</TableCell>
            <TableCell>
              <StatusBadge status={ticket.status} />
            </TableCell>
            <TableCell>
              {ticket.aiPriority ? (
                <PriorityBadge priority={ticket.aiPriority} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              {ticket.aiCategory ? (
                <CategoryBadge category={ticket.aiCategory} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDate(ticket.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

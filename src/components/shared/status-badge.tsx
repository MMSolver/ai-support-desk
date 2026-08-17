import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, type TicketStatus } from '@/lib/utils/constants';

/** Status -> color mapping (PROJECT.md §19). */
const STATUS_STYLES: Record<TicketStatus, string> = {
  open: 'border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400',
  in_progress: 'border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  resolved: 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400',
  closed: 'border-transparent bg-muted text-muted-foreground',
  needs_review: 'border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-400',
};

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

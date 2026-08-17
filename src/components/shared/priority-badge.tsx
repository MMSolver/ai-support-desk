import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PRIORITY_LABELS, type TicketPriority } from '@/lib/utils/constants';

/** Priority -> color mapping (PROJECT.md §19). */
const PRIORITY_STYLES: Record<TicketPriority, string> = {
  urgent: 'border-transparent bg-red-500/15 text-red-700 dark:text-red-400',
  high: 'border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-400',
  medium: 'border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400',
  low: 'border-transparent bg-muted text-muted-foreground',
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(PRIORITY_STYLES[priority], className)}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

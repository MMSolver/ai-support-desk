import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS, type TicketCategory } from '@/lib/utils/constants';

/**
 * No color coding is specified for categories in PROJECT.md §19 (only
 * priority and status get one) — a neutral badge is enough to label them.
 */
export function CategoryBadge({
  category,
  className,
}: {
  category: TicketCategory;
  className?: string;
}) {
  return (
    <Badge variant="secondary" className={className}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}

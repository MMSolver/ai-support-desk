'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from '@/lib/utils/constants';

const ALL = '__all__';

type FilterKey = 'status' | 'priority' | 'category';

/**
 * Status/priority/category filter controls for the ticket list
 * (PROJECT.md §8/§9). The URL query string is the single source of truth —
 * changing a filter here updates it, and the list page (a Server Component)
 * re-fetches from it. No client-side fetch or local list state involved.
 */
export function TicketFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: FilterKey, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    const query = params.toString();
    router.push(query ? `/tickets?${query}` : '/tickets');
  }

  const hasFilters = (['status', 'priority', 'category'] as const).some((key) =>
    searchParams.has(key),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select<string>
        value={searchParams.get('status') ?? ALL}
        onValueChange={(value) => setFilter('status', value ?? ALL)}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Status">
            {(value: string) =>
              value === ALL ? 'All statuses' : STATUS_LABELS[value as TicketStatus]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {TICKET_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select<string>
        value={searchParams.get('priority') ?? ALL}
        onValueChange={(value) => setFilter('priority', value ?? ALL)}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Priority">
            {(value: string) =>
              value === ALL ? 'All priorities' : PRIORITY_LABELS[value as TicketPriority]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          {TICKET_PRIORITIES.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select<string>
        value={searchParams.get('category') ?? ALL}
        onValueChange={(value) => setFilter('category', value ?? ALL)}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Category">
            {(value: string) =>
              value === ALL ? 'All categories' : CATEGORY_LABELS[value as TicketCategory]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          {TICKET_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => router.push('/tickets')}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

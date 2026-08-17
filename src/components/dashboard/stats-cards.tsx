import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
} from '@/lib/utils/constants';
import type { DashboardStats } from '@/types';

/** Dashboard stat cards + breakdowns (PROJECT.md §9/§26). */
export function StatsCards({ stats }: { stats: DashboardStats }) {
  const highlights = [
    { label: 'Total Tickets', value: stats.totalTickets },
    { label: 'Open', value: stats.byStatus.open },
    { label: 'Needs Review', value: stats.byStatus.needs_review },
    { label: 'Urgent', value: stats.byPriority.urgent },
  ];

  const maxTrendCount = Math.max(1, ...stats.last7DaysTrend.map((day) => day.count));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {highlights.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-normal">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TICKET_PRIORITIES.map((priority) => (
              <div key={priority} className="flex items-center justify-between text-sm">
                <span>{PRIORITY_LABELS[priority]}</span>
                <span className="text-muted-foreground tabular-nums">
                  {stats.byPriority[priority]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TICKET_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span>{CATEGORY_LABELS[category]}</span>
                <span className="text-muted-foreground tabular-nums">
                  {stats.byCategory[category]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-end gap-2">
            {stats.last7DaysTrend.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="bg-primary/70 w-full rounded-t-sm"
                  style={{ height: `${Math.max(4, (day.count / maxTrendCount) * 100)}%` }}
                  title={`${day.date}: ${day.count}`}
                />
                <span className="text-muted-foreground text-[0.65rem]">{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

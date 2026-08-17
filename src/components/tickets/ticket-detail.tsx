import { CategoryBadge } from '@/components/shared/category-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils/format';
import type { Ticket } from '@/types';

/**
 * Ticket detail: original message + AI analysis, side by side on desktop
 * (PROJECT.md §8/§16/§20). Shows a pending/needs-review banner instead of
 * the analysis section when the AI fields aren't populated yet.
 */
export function TicketDetail({ ticket }: { ticket: Ticket }) {
  const hasAnalysis = ticket.aiCategory !== null && ticket.aiPriority !== null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{ticket.subject}</CardTitle>
            <StatusBadge status={ticket.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
          <dl className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="font-medium">From</dt>
              <dd>{ticket.customerName || 'Anonymous'}</dd>
            </div>
            <div>
              <dt className="font-medium">Email</dt>
              <dd>{ticket.customerEmail || '—'}</dd>
            </div>
            <div>
              <dt className="font-medium">Submitted</dt>
              <dd>{formatDateTime(ticket.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium">Source</dt>
              <dd>{ticket.source}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {hasAnalysis && ticket.aiCategory && ticket.aiPriority ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <PriorityBadge priority={ticket.aiPriority} />
                <CategoryBadge category={ticket.aiCategory} />
              </div>
              {ticket.aiSummary ? (
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Summary</p>
                  <p className="text-sm">{ticket.aiSummary}</p>
                </div>
              ) : null}
              {ticket.aiSuggestedResponse ? (
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Suggested response</p>
                  <p className="text-sm whitespace-pre-wrap">{ticket.aiSuggestedResponse}</p>
                </div>
              ) : null}
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {ticket.aiConfidence !== null ? (
                  <span>Confidence: {Math.round(ticket.aiConfidence * 100)}%</span>
                ) : null}
                {ticket.aiModel ? <span>Model: {ticket.aiModel}</span> : null}
                {ticket.aiProcessingTimeMs !== null ? (
                  <span>{ticket.aiProcessingTimeMs}ms</span>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {ticket.status === 'needs_review'
                ? 'AI analysis could not be completed automatically. This ticket needs manual review.'
                : 'Analysis pending — this ticket will be analyzed shortly.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

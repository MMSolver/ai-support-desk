import { AlertTriangleIcon, SparklesIcon } from 'lucide-react';

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

      <Card data-testid="ai-analysis">
        <CardHeader>
          <CardTitle>AI analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {hasAnalysis && ticket.aiCategory && ticket.aiPriority ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span data-testid="ai-priority">
                  <PriorityBadge priority={ticket.aiPriority} />
                </span>
                <span data-testid="ai-category">
                  <CategoryBadge category={ticket.aiCategory} />
                </span>
              </div>
              {ticket.aiSummary ? (
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Summary</p>
                  <p data-testid="ai-summary" className="text-sm">
                    {ticket.aiSummary}
                  </p>
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
          ) : ticket.status === 'needs_review' ? (
            <div
              data-testid="needs-review-banner"
              className="border-destructive/30 bg-destructive/5 flex items-start gap-2.5 rounded-lg border px-3 py-2.5"
            >
              <AlertTriangleIcon
                className="text-destructive mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm">
                AI analysis could not be completed automatically. This ticket needs manual review.
              </p>
            </div>
          ) : (
            <div
              data-testid="analysis-pending-banner"
              className="border-border bg-muted/30 flex items-start gap-2.5 rounded-lg border px-3 py-2.5"
            >
              <SparklesIcon
                className="text-muted-foreground mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-sm">
                Analysis pending — this ticket will be analyzed shortly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

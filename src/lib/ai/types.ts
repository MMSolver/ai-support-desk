import type { TicketCategory, TicketPriority } from '@/lib/utils/constants';

/**
 * Structured output produced by an AI provider for a single support ticket
 * (PROJECT.md §11/§12).
 */
export interface TicketAnalysis {
  category: TicketCategory;
  priority: TicketPriority;
  summary: string;
  suggestedResponse: string;
  confidence: number;
}

import { z } from 'zod';

import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '@/lib/utils/constants';

/**
 * Validates the structured output returned by the AI service (PROJECT.md §12).
 * Runs as the second half of the "belt and suspenders" validation, after
 * OpenAI's own `strict: true` JSON Schema enforcement.
 */
export const ticketAnalysisSchema = z.object({
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES),
  summary: z.string().min(10).max(200),
  suggestedResponse: z.string().min(20).max(1000),
  confidence: z.number().min(0).max(1),
});

/**
 * Validates the body of `POST /api/tickets` (PROJECT.md §14).
 */
export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be under 200 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be under 5000 characters'),
  customerName: z.string().trim().max(100).optional().or(z.literal('')),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
});

/**
 * Validates the query parameters of `GET /api/tickets` (PROJECT.md §14).
 */
export const listTicketsSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  category: z.enum(TICKET_CATEGORIES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsSchema>;

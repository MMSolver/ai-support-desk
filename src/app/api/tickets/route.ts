import { NextRequest } from 'next/server';

import { getAIService } from '@/lib/ai/service';
import { apiError, apiSuccess } from '@/lib/api/response';
import {
  createTicket,
  listTickets,
  markTicketNeedsReview,
  updateTicketAnalysis,
} from '@/lib/db/queries';
import { createTicketSchema, listTicketsSchema } from '@/lib/validations/ticket';
import type { Ticket } from '@/types';

/**
 * Creates a ticket and runs AI analysis on it (PROJECT.md §9/§13).
 *
 * The ticket is persisted *before* the AI call and is never lost if that
 * call fails: on AI failure the ticket is marked `needs_review` and a 201
 * with a `warning` is still returned (PROJECT.md §11/§15) — the caller
 * should treat `success: true` as "the ticket was saved", not "AI analysis
 * completed".
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('VALIDATION_ERROR', 'Request body must be valid JSON.', { status: 400 });
  }

  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Invalid ticket data.', {
      status: 400,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { subject, message, customerName, customerEmail } = parsed.data;

  let ticket: Ticket;
  try {
    ticket = await createTicket({
      subject,
      message,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
    });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return apiError('INTERNAL_ERROR', 'Failed to save ticket. Please try again.', { status: 500 });
  }

  const aiService = getAIService();
  const startedAt = Date.now();

  try {
    const analysis = await aiService.analyzeTicket(subject, message);
    const analyzed = await updateTicketAnalysis(ticket.id, {
      ...analysis,
      model: aiService.modelName,
      processingTimeMs: Date.now() - startedAt,
    });
    return apiSuccess<Ticket>(analyzed, { status: 201 });
  } catch (error) {
    console.error(`AI analysis failed for ticket ${ticket.id}:`, error);

    try {
      const needsReview = await markTicketNeedsReview(ticket.id);
      return apiSuccess<Ticket>(needsReview, {
        status: 201,
        warning: 'AI analysis failed; this ticket needs manual review.',
      });
    } catch (dbError) {
      // Both the AI call and the needs_review update failed. The ticket
      // itself was still saved (status: 'processing') — return that rather
      // than reporting the whole request as failed.
      console.error(`Failed to mark ticket ${ticket.id} as needs_review:`, dbError);
      return apiSuccess<Ticket>(ticket, {
        status: 201,
        warning: 'AI analysis failed; this ticket needs manual review.',
      });
    }
  }
}

/**
 * Lists tickets, filtered and paginated (PROJECT.md §9/§14).
 */
export async function GET(request: NextRequest) {
  const query = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listTicketsSchema.safeParse(query);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Invalid query parameters.', {
      status: 400,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const result = await listTickets(parsed.data);
    return apiSuccess(result, { status: 200 });
  } catch (error) {
    console.error('Failed to list tickets:', error);
    return apiError('INTERNAL_ERROR', 'Failed to fetch tickets.', { status: 500 });
  }
}

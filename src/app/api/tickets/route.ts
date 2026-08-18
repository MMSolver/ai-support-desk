import { NextRequest } from 'next/server';

import { getAIService } from '@/lib/ai/service';
import type { TicketAnalysis } from '@/lib/ai/types';
import { apiError, apiSuccess } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import {
  createTicket,
  listTickets,
  markTicketNeedsReview,
  updateTicketAnalysis,
} from '@/lib/db/queries';
import { createTicketSchema, listTicketsSchema } from '@/lib/validations/ticket';
import type { Ticket } from '@/types';

/**
 * Falls back to `needs_review` when AI analysis could not be produced or
 * persisted. The ticket itself was already saved by `createTicket` earlier
 * in the request, so it's never lost (PROJECT.md §11/§15) — this only
 * decides how its status/response reflect that the analysis didn't land.
 */
async function fallbackToNeedsReview(
  ticket: Ticket,
): Promise<ReturnType<typeof apiSuccess<Ticket>>> {
  try {
    const needsReview = await markTicketNeedsReview(ticket.id);
    return apiSuccess<Ticket>(needsReview, {
      status: 201,
      warning: 'AI analysis failed; this ticket needs manual review.',
    });
  } catch (dbError) {
    // The needs_review update itself failed too. The ticket row still
    // exists (status: ticket.status) — report that accurately rather than
    // claiming a status transition that didn't happen.
    console.error(`Failed to mark ticket ${ticket.id} as needs_review:`, dbError);
    return apiSuccess<Ticket>(ticket, {
      status: 201,
      warning: `AI analysis failed; the ticket was saved but its review status could not be updated (still '${ticket.status}').`,
    });
  }
}

/**
 * Creates a ticket and runs AI analysis on it (PROJECT.md §9/§13).
 *
 * The ticket is persisted *before* the AI call and is never lost if that
 * call fails: on AI failure the ticket is marked `needs_review` and a 201
 * with a `warning` is still returned (PROJECT.md §11/§15) — the caller
 * should treat `success: true` as "the ticket was saved", not "AI analysis
 * completed".
 *
 * Rate limited per-IP (PROJECT.md §18) since every request here triggers a
 * real OpenAI call — this is the one endpoint that actually costs money per
 * request.
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers);
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many requests. Please try again shortly.', {
      status: 429,
      headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
    });
  }

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

  let analysis: TicketAnalysis;
  try {
    analysis = await aiService.analyzeTicket(subject, message);
  } catch (error) {
    console.error(`AI analysis failed for ticket ${ticket.id}:`, error);
    return fallbackToNeedsReview(ticket);
  }

  try {
    const analyzed = await updateTicketAnalysis(ticket.id, {
      ...analysis,
      model: aiService.modelName,
      processingTimeMs: Date.now() - startedAt,
    });
    return apiSuccess<Ticket>(analyzed, { status: 201 });
  } catch (dbError) {
    // The AI call succeeded but persisting its result failed — a DB
    // problem, not an AI one. Distinguished from the block above so the
    // log (and, if ever needed, the handling) doesn't misattribute it.
    console.error(`Failed to persist AI analysis for ticket ${ticket.id}:`, dbError);
    return fallbackToNeedsReview(ticket);
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

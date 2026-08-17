import { NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/api/response';
import { getTicketById } from '@/lib/db/queries';
import { ticketIdSchema } from '@/lib/validations/ticket';

/**
 * Fetches a single ticket by id (PROJECT.md §9).
 */
export async function GET(_request: NextRequest, ctx: RouteContext<'/api/tickets/[id]'>) {
  const { id } = await ctx.params;

  const parsedId = ticketIdSchema.safeParse(id);
  if (!parsedId.success) {
    return apiError('VALIDATION_ERROR', 'Invalid ticket id.', { status: 400 });
  }

  try {
    const ticket = await getTicketById(parsedId.data);
    if (!ticket) {
      return apiError('NOT_FOUND', 'Ticket not found.', { status: 404 });
    }
    return apiSuccess(ticket, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch ticket ${id}:`, error);
    return apiError('INTERNAL_ERROR', 'Failed to fetch ticket.', { status: 500 });
  }
}

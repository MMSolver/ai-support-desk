import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTicketById } from '@/lib/db/queries';
import type { Ticket } from '@/types';

import { GET } from './route';

vi.mock('@/lib/db/queries', () => ({
  getTicketById: vi.fn(),
}));

const ticket: Ticket = {
  id: '3e3966bd-3985-471a-a61c-b08c6e1f32ac',
  subject: 'Cannot access my account',
  message: 'Locked out since yesterday.',
  customerName: null,
  customerEmail: null,
  source: 'web_form',
  status: 'open',
  aiCategory: 'account',
  aiPriority: 'high',
  aiSummary: 'Customer is locked out.',
  aiSuggestedResponse: 'Please reset your password.',
  aiConfidence: 0.9,
  aiModel: 'gpt-4o-mini',
  aiProcessingTimeMs: 850,
  createdAt: '2026-08-18T10:00:00.000Z',
  updatedAt: '2026-08-18T10:00:00.000Z',
};

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.mocked(getTicketById).mockReset();
});

describe('GET /api/tickets/[id]', () => {
  it('returns the ticket when found', async () => {
    vi.mocked(getTicketById).mockResolvedValue(ticket);

    const response = await GET(
      new NextRequest(`http://localhost/api/tickets/${ticket.id}`),
      ctx(ticket.id),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ success: true, data: { id: ticket.id } });
  });

  it('returns 404 NOT_FOUND when no ticket matches', async () => {
    vi.mocked(getTicketById).mockResolvedValue(null);

    const response = await GET(
      new NextRequest('http://localhost/api/tickets/00000000-0000-0000-0000-000000000000'),
      ctx('00000000-0000-0000-0000-000000000000'),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 VALIDATION_ERROR for a malformed id, without querying the DB', async () => {
    const response = await GET(
      new NextRequest('http://localhost/api/tickets/not-a-uuid'),
      ctx('not-a-uuid'),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(getTicketById).not.toHaveBeenCalled();
  });

  it('returns 500 INTERNAL_ERROR when the DB call fails', async () => {
    vi.mocked(getTicketById).mockRejectedValue(new Error('timeout'));

    const response = await GET(
      new NextRequest(`http://localhost/api/tickets/${ticket.id}`),
      ctx(ticket.id),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });
});

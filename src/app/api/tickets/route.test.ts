import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAIService } from '@/lib/ai/service';
import { checkRateLimit } from '@/lib/api/rate-limit';
import {
  createTicket,
  listTickets,
  markTicketNeedsReview,
  updateTicketAnalysis,
} from '@/lib/db/queries';
import type { Ticket } from '@/types';

import { GET, POST } from './route';

/**
 * Integration tests for `/api/tickets` (PROJECT.md §21: "Her endpoint icin:
 * basarili, validation hatasi, DB hatasi, AI hatasi senaryolari"). The DB
 * query layer and the AI service are mocked at their module boundary — real
 * Supabase/OpenAI calls are exercised by the Playwright E2E suite instead.
 * The rate limiter is mocked to always allow by default (it has its own
 * dedicated unit tests in `rate-limit.test.ts`) except in the one test that
 * exercises the 429 path below — mocking it also avoids these tests sharing
 * real rate-limit bucket state across each other via module-level memory.
 */
vi.mock('@/lib/db/queries', () => ({
  createTicket: vi.fn(),
  listTickets: vi.fn(),
  markTicketNeedsReview: vi.fn(),
  updateTicketAnalysis: vi.fn(),
}));

vi.mock('@/lib/ai/service', () => ({
  getAIService: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(() => 'test-ip'),
}));

const validBody = {
  subject: 'Cannot access my account',
  message: 'I have been locked out of my account since yesterday.',
};

const baseTicket: Ticket = {
  id: '3e3966bd-3985-471a-a61c-b08c6e1f32ac',
  subject: validBody.subject,
  message: validBody.message,
  customerName: null,
  customerEmail: null,
  source: 'web_form',
  status: 'processing',
  aiCategory: null,
  aiPriority: null,
  aiSummary: null,
  aiSuggestedResponse: null,
  aiConfidence: null,
  aiModel: null,
  aiProcessingTimeMs: null,
  createdAt: '2026-08-18T10:00:00.000Z',
  updatedAt: '2026-08-18T10:00:00.000Z',
};

const analysis = {
  category: 'account' as const,
  priority: 'high' as const,
  summary: 'Customer is locked out of their account.',
  suggestedResponse: 'Please reset your password using the link on the login page.',
  confidence: 0.9,
};

function postRequest(body: unknown, raw?: string) {
  return new NextRequest('http://localhost/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  });
}

function getRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/tickets');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

beforeEach(() => {
  vi.mocked(createTicket).mockReset();
  vi.mocked(listTickets).mockReset();
  vi.mocked(markTicketNeedsReview).mockReset();
  vi.mocked(updateTicketAnalysis).mockReset();
  vi.mocked(getAIService).mockReset();
  vi.mocked(checkRateLimit).mockReset().mockReturnValue({ allowed: true });
});

describe('POST /api/tickets', () => {
  it('returns 429 RATE_LIMITED without touching the DB when the caller is rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterSeconds: 42 });

    const response = await POST(postRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('42');
    expect(body.error.code).toBe('RATE_LIMITED');
    expect(createTicket).not.toHaveBeenCalled();
  });

  it('creates a ticket and returns it with AI analysis on success', async () => {
    vi.mocked(createTicket).mockResolvedValue(baseTicket);
    vi.mocked(getAIService).mockReturnValue({
      modelName: 'gpt-4o-mini',
      analyzeTicket: vi.fn().mockResolvedValue(analysis),
    });
    vi.mocked(updateTicketAnalysis).mockResolvedValue({
      ...baseTicket,
      status: 'open',
      aiCategory: analysis.category,
      aiPriority: analysis.priority,
    });

    const response = await POST(postRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({ success: true, data: { status: 'open', aiPriority: 'high' } });
  });

  it('returns 400 VALIDATION_ERROR for an invalid body without touching the DB', async () => {
    const response = await POST(postRequest({ subject: 'Hi' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
    expect(createTicket).not.toHaveBeenCalled();
  });

  it('returns 400 VALIDATION_ERROR for a malformed JSON body', async () => {
    const response = await POST(postRequest(undefined, '{not json'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 INTERNAL_ERROR when saving the ticket fails, without calling the AI service', async () => {
    vi.mocked(createTicket).mockRejectedValue(new Error('connection refused'));

    const response = await POST(postRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(getAIService).not.toHaveBeenCalled();
  });

  it('falls back to needs_review with a warning when AI analysis fails', async () => {
    vi.mocked(createTicket).mockResolvedValue(baseTicket);
    vi.mocked(getAIService).mockReturnValue({
      modelName: 'gpt-4o-mini',
      analyzeTicket: vi.fn().mockRejectedValue(new Error('AI request timed out')),
    });
    vi.mocked(markTicketNeedsReview).mockResolvedValue({ ...baseTicket, status: 'needs_review' });

    const response = await POST(postRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('needs_review');
    expect(body.warning).toMatch(/AI analysis failed/i);
    expect(updateTicketAnalysis).not.toHaveBeenCalled();
  });

  it('still returns 201 with a warning if marking needs_review also fails', async () => {
    vi.mocked(createTicket).mockResolvedValue(baseTicket);
    vi.mocked(getAIService).mockReturnValue({
      modelName: 'gpt-4o-mini',
      analyzeTicket: vi.fn().mockRejectedValue(new Error('AI request timed out')),
    });
    vi.mocked(markTicketNeedsReview).mockRejectedValue(new Error('db write failed'));

    const response = await POST(postRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(baseTicket.id);
    expect(body.warning).toMatch(/review status could not be updated/i);
  });

  it('falls back to needs_review when the AI call succeeds but persisting the analysis fails', async () => {
    vi.mocked(createTicket).mockResolvedValue(baseTicket);
    vi.mocked(getAIService).mockReturnValue({
      modelName: 'gpt-4o-mini',
      analyzeTicket: vi.fn().mockResolvedValue(analysis),
    });
    vi.mocked(updateTicketAnalysis).mockRejectedValue(new Error('db write failed'));
    vi.mocked(markTicketNeedsReview).mockResolvedValue({ ...baseTicket, status: 'needs_review' });

    const response = await POST(postRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.status).toBe('needs_review');
    expect(markTicketNeedsReview).toHaveBeenCalledWith(baseTicket.id);
  });
});

describe('GET /api/tickets', () => {
  it('lists tickets with default pagination', async () => {
    vi.mocked(listTickets).mockResolvedValue({ data: [baseTicket], total: 1, page: 1, limit: 10 });

    const response = await GET(getRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ success: true, data: { total: 1, page: 1, limit: 10 } });
  });

  it('passes filters through to listTickets', async () => {
    vi.mocked(listTickets).mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

    await GET(getRequest({ status: 'open', priority: 'high', category: 'billing' }));

    expect(listTickets).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'open', priority: 'high', category: 'billing' }),
    );
  });

  it('returns 400 VALIDATION_ERROR for an invalid query parameter', async () => {
    const response = await GET(getRequest({ status: 'bogus' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(listTickets).not.toHaveBeenCalled();
  });

  it('returns 500 INTERNAL_ERROR when the DB call fails', async () => {
    vi.mocked(listTickets).mockRejectedValue(new Error('query failed'));

    const response = await GET(getRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });
});

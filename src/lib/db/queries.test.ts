import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getServiceSupabase } from './supabase-admin';
import type { TicketRow } from './types';

/**
 * Unit tests for the DB query layer (PROJECT.md §21: "Supabase query builder
 * fonksiyonlari (mocked)"). `getServiceSupabase()` is mocked with a minimal
 * chainable stand-in for Supabase's fluent query builder — real
 * network/Postgres behavior is out of scope here; that's covered by the
 * integration tests against the API routes and, for the full round trip, by
 * the Playwright E2E suite.
 */
vi.mock('./supabase-admin', () => ({
  getServiceSupabase: vi.fn(),
}));

interface BuilderResult {
  data: unknown;
  error: unknown;
  count?: number | null;
}

/**
 * A chainable mock matching the subset of Supabase's query builder API used
 * by `queries.ts`: every chain method returns the same builder, and the
 * builder is itself thenable (like the real one) so `await` works whether or
 * not a terminal method (`single`/`maybeSingle`) was called.
 */
interface MockBuilder {
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  then: (resolve: (value: BuilderResult) => unknown) => Promise<unknown>;
}

function makeBuilder(result: BuilderResult): MockBuilder {
  const builder: MockBuilder = {
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

function mockFrom(result: BuilderResult) {
  const builder = makeBuilder(result);
  const from = vi.fn(() => builder);
  vi.mocked(getServiceSupabase).mockReturnValue({
    from,
  } as unknown as ReturnType<typeof getServiceSupabase>);
  return { builder, from };
}

const sampleRow: TicketRow = {
  id: '3e3966bd-3985-471a-a61c-b08c6e1f32ac',
  subject: 'Cannot access my account',
  message: 'Locked out since yesterday.',
  customer_name: 'Jane Doe',
  customer_email: 'jane@example.com',
  source: 'web_form',
  status: 'open',
  ai_category: 'account',
  ai_priority: 'high',
  ai_summary: 'Customer is locked out.',
  ai_suggested_response: 'Please reset your password.',
  ai_confidence: 0.9,
  ai_model: 'gpt-4o-mini',
  ai_processing_time_ms: 850,
  created_at: '2026-08-18T10:00:00.000Z',
  updated_at: '2026-08-18T10:00:00.000Z',
};

beforeEach(() => {
  vi.mocked(getServiceSupabase).mockReset();
});

describe('createTicket', () => {
  it('maps the inserted row to the app-level Ticket shape', async () => {
    mockFrom({ data: sampleRow, error: null });
    const { createTicket } = await import('./queries');

    const ticket = await createTicket({ subject: sampleRow.subject, message: sampleRow.message });

    expect(ticket.id).toBe(sampleRow.id);
    expect(ticket.customerName).toBe('Jane Doe');
    expect(ticket.aiPriority).toBe('high');
  });

  it('throws a descriptive error when the insert fails', async () => {
    mockFrom({ data: null, error: { message: 'connection refused' } });
    const { createTicket } = await import('./queries');

    await expect(
      createTicket({ subject: sampleRow.subject, message: sampleRow.message }),
    ).rejects.toThrow(/connection refused/);
  });
});

describe('updateTicketAnalysis', () => {
  it('returns the updated ticket with AI fields populated', async () => {
    mockFrom({ data: sampleRow, error: null });
    const { updateTicketAnalysis } = await import('./queries');

    const ticket = await updateTicketAnalysis(sampleRow.id, {
      category: 'account',
      priority: 'high',
      summary: sampleRow.ai_summary!,
      suggestedResponse: sampleRow.ai_suggested_response!,
      confidence: 0.9,
      model: 'gpt-4o-mini',
      processingTimeMs: 850,
    });

    expect(ticket.status).toBe('open');
    expect(ticket.aiModel).toBe('gpt-4o-mini');
  });

  it('throws a descriptive error when the update fails', async () => {
    mockFrom({ data: null, error: { message: 'row not found' } });
    const { updateTicketAnalysis } = await import('./queries');

    await expect(
      updateTicketAnalysis(sampleRow.id, {
        category: 'account',
        priority: 'high',
        summary: 'x'.repeat(20),
        suggestedResponse: 'y'.repeat(30),
        confidence: 0.5,
        model: 'gpt-4o-mini',
        processingTimeMs: 100,
      }),
    ).rejects.toThrow(/row not found/);
  });
});

describe('markTicketNeedsReview', () => {
  it('returns the ticket with status needs_review', async () => {
    mockFrom({ data: { ...sampleRow, status: 'needs_review' }, error: null });
    const { markTicketNeedsReview } = await import('./queries');

    const ticket = await markTicketNeedsReview(sampleRow.id);

    expect(ticket.status).toBe('needs_review');
  });
});

describe('getTicketById', () => {
  it('returns the mapped ticket when found', async () => {
    mockFrom({ data: sampleRow, error: null });
    const { getTicketById } = await import('./queries');

    const ticket = await getTicketById(sampleRow.id);

    expect(ticket?.id).toBe(sampleRow.id);
  });

  it('returns null (not an error) when no row matches', async () => {
    mockFrom({ data: null, error: null });
    const { getTicketById } = await import('./queries');

    const ticket = await getTicketById('00000000-0000-0000-0000-000000000000');

    expect(ticket).toBeNull();
  });

  it('throws a descriptive error on a DB error', async () => {
    mockFrom({ data: null, error: { message: 'timeout' } });
    const { getTicketById } = await import('./queries');

    await expect(getTicketById(sampleRow.id)).rejects.toThrow(/timeout/);
  });
});

describe('listTickets', () => {
  it('returns paginated results mapped to the app-level shape', async () => {
    const { builder } = mockFrom({ data: [sampleRow], error: null, count: 1 });
    const { listTickets } = await import('./queries');

    const result = await listTickets({ page: 1, limit: 10 });

    expect(result).toEqual({
      data: [expect.objectContaining({ id: sampleRow.id })],
      total: 1,
      page: 1,
      limit: 10,
    });
    // No filters supplied: .eq() should not have been called.
    expect(builder.eq).not.toHaveBeenCalled();
  });

  it('applies status/priority/category filters via .eq()', async () => {
    const { builder } = mockFrom({ data: [], error: null, count: 0 });
    const { listTickets } = await import('./queries');

    await listTickets({
      status: 'open',
      priority: 'high',
      category: 'billing',
      page: 1,
      limit: 10,
    });

    expect(builder.eq).toHaveBeenCalledWith('status', 'open');
    expect(builder.eq).toHaveBeenCalledWith('ai_priority', 'high');
    expect(builder.eq).toHaveBeenCalledWith('ai_category', 'billing');
  });

  it('computes range from page/limit', async () => {
    const { builder } = mockFrom({ data: [], error: null, count: 0 });
    const { listTickets } = await import('./queries');

    await listTickets({ page: 3, limit: 10 });

    expect(builder.range).toHaveBeenCalledWith(20, 29);
  });

  it('defaults total to 0 when count is null', async () => {
    mockFrom({ data: [], error: null, count: null });
    const { listTickets } = await import('./queries');

    const result = await listTickets({ page: 1, limit: 10 });

    expect(result.total).toBe(0);
  });

  it('throws a descriptive error on a DB error', async () => {
    mockFrom({ data: null, error: { message: 'query failed' } });
    const { listTickets } = await import('./queries');

    await expect(listTickets({ page: 1, limit: 10 })).rejects.toThrow(/query failed/);
  });
});

describe('getDashboardStats', () => {
  it('aggregates counts across every bucket, including zero-count ones', async () => {
    mockFrom({
      data: [
        {
          ai_priority: 'high',
          ai_category: 'billing',
          status: 'open',
          created_at: sampleRow.created_at,
        },
        {
          ai_priority: 'high',
          ai_category: 'billing',
          status: 'open',
          created_at: sampleRow.created_at,
        },
        {
          ai_priority: null,
          ai_category: null,
          status: 'processing',
          created_at: sampleRow.created_at,
        },
      ],
      error: null,
    });
    const { getDashboardStats } = await import('./queries');

    const stats = await getDashboardStats();

    expect(stats.totalTickets).toBe(3);
    expect(stats.byPriority.high).toBe(2);
    expect(stats.byPriority.low).toBe(0);
    expect(stats.byCategory.billing).toBe(2);
    expect(stats.byStatus.open).toBe(2);
    expect(stats.byStatus.processing).toBe(1);
    expect(Object.values(stats.byStatus).reduce((a, b) => a + b, 0)).toBe(3);
  });

  it('builds a 7-day trend with every day present, oldest first', async () => {
    mockFrom({ data: [], error: null });
    const { getDashboardStats } = await import('./queries');

    const stats = await getDashboardStats();

    expect(stats.last7DaysTrend).toHaveLength(7);
    const dates = stats.last7DaysTrend.map((d) => d.date);
    expect([...dates].sort()).toEqual(dates);
    expect(stats.last7DaysTrend.every((d) => d.count === 0)).toBe(true);
  });

  it('throws a descriptive error on a DB error', async () => {
    mockFrom({ data: null, error: { message: 'db unavailable' } });
    const { getDashboardStats } = await import('./queries');

    await expect(getDashboardStats()).rejects.toThrow(/db unavailable/);
  });
});

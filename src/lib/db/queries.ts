import { getServiceSupabase } from './supabase-admin';
import type { TicketRow } from './types';
import type { Ticket, DashboardStats, PaginatedResult } from '@/types';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from '@/lib/utils/constants';

/**
 * Maps a raw `tickets` table row (snake_case) to the app-level `Ticket`
 * shape (camelCase) used by API routes and the frontend.
 */
function mapRowToTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    subject: row.subject,
    message: row.message,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    source: row.source,
    status: row.status as TicketStatus,

    aiCategory: row.ai_category as TicketCategory | null,
    aiPriority: row.ai_priority as TicketPriority | null,
    aiSummary: row.ai_summary,
    aiSuggestedResponse: row.ai_suggested_response,
    aiConfidence: row.ai_confidence,
    aiModel: row.ai_model,
    aiProcessingTimeMs: row.ai_processing_time_ms,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Persistence-layer input shape — distinct from (and named differently
 * than) `CreateTicketInput` in `@/lib/validations/ticket`, which is the
 * *request-validation* type (allows `''` for optional fields, inferred from
 * the Zod schema). Callers validate with that schema first, then normalize
 * `''` -> `null` before calling `createTicket`.
 */
export interface CreateTicketDbInput {
  subject: string;
  message: string;
  customerName?: string | null;
  customerEmail?: string | null;
}

/**
 * Inserts a new ticket with `status: 'processing'` and all `ai_*` fields
 * null. The AI analysis is filled in afterwards via `updateTicketAnalysis`
 * (or the ticket is marked `needs_review` via `markTicketNeedsReview` on AI
 * failure) — see PROJECT.md §13.
 */
export async function createTicket(input: CreateTicketDbInput): Promise<Ticket> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      subject: input.subject,
      message: input.message,
      customer_name: input.customerName ?? null,
      customer_email: input.customerEmail ?? null,
      source: 'web_form',
      status: 'processing',
      ai_category: null,
      ai_priority: null,
      ai_summary: null,
      ai_suggested_response: null,
      ai_confidence: null,
      ai_model: null,
      ai_processing_time_ms: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ticket: ${error.message}`);
  }

  return mapRowToTicket(data);
}

export interface TicketAnalysisInput {
  category: string;
  priority: string;
  summary: string;
  suggestedResponse: string;
  confidence: number;
  model: string;
  processingTimeMs: number;
}

/**
 * Fills in the `ai_*` columns after a successful AI analysis and sets
 * `status: 'open'`.
 */
export async function updateTicketAnalysis(
  id: string,
  analysis: TicketAnalysisInput,
): Promise<Ticket> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('tickets')
    .update({
      ai_category: analysis.category,
      ai_priority: analysis.priority,
      ai_summary: analysis.summary,
      ai_suggested_response: analysis.suggestedResponse,
      ai_confidence: analysis.confidence,
      ai_model: analysis.model,
      ai_processing_time_ms: analysis.processingTimeMs,
      status: 'open',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update ticket analysis (id: ${id}): ${error.message}`);
  }

  return mapRowToTicket(data);
}

/**
 * Marks a ticket as `needs_review` when AI analysis fails. The customer's
 * original ticket is never lost — see PROJECT.md §11/§15.
 */
export async function markTicketNeedsReview(id: string): Promise<Ticket> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('tickets')
    .update({ status: 'needs_review' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark ticket as needs_review (id: ${id}): ${error.message}`);
  }

  return mapRowToTicket(data);
}

/**
 * Fetches a single ticket by id. Returns `null` if not found (callers map
 * that to a 404 — this function never throws for a missing row).
 */
export async function getTicketById(id: string): Promise<Ticket | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase.from('tickets').select().eq('id', id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch ticket (id: ${id}): ${error.message}`);
  }

  return data ? mapRowToTicket(data) : null;
}

export interface ListTicketsFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  page: number;
  limit: number;
}

/**
 * Filtered, paginated ticket list, ordered by `created_at DESC`. `total` is
 * the exact row count matching the filters (not just the current page).
 */
export async function listTickets(filters: ListTicketsFilters): Promise<PaginatedResult<Ticket>> {
  const supabase = getServiceSupabase();
  const { status, priority, category, page, limit } = filters;

  let query = supabase.from('tickets').select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }
  if (priority) {
    query = query.eq('ai_priority', priority);
  }
  if (category) {
    query = query.eq('ai_category', category);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to list tickets: ${error.message}`);
  }

  return {
    data: (data ?? []).map(mapRowToTicket),
    total: count ?? 0,
    page,
    limit,
  };
}

/**
 * Aggregate dashboard stats: total count, per-priority/category/status
 * breakdowns (every bucket from constants.ts present even at 0), and a
 * 7-day (UTC, oldest -> newest) creation trend.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('tickets')
    .select('ai_priority, ai_category, status, created_at');

  if (error) {
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
  }

  const rows = data ?? [];

  const byPriority = Object.fromEntries(
    TICKET_PRIORITIES.map((priority) => [priority, 0]),
  ) as Record<TicketPriority, number>;

  const byCategory = Object.fromEntries(
    TICKET_CATEGORIES.map((category) => [category, 0]),
  ) as Record<TicketCategory, number>;

  const byStatus = Object.fromEntries(TICKET_STATUSES.map((status) => [status, 0])) as Record<
    TicketStatus,
    number
  >;

  for (const row of rows) {
    if (row.ai_priority && row.ai_priority in byPriority) {
      byPriority[row.ai_priority as TicketPriority] += 1;
    }
    if (row.ai_category && row.ai_category in byCategory) {
      byCategory[row.ai_category as TicketCategory] += 1;
    }
    if (row.status in byStatus) {
      byStatus[row.status as TicketStatus] += 1;
    }
  }

  const last7DaysTrend = buildLast7DaysTrend(rows.map((row) => row.created_at));

  return {
    totalTickets: rows.length,
    byPriority,
    byCategory,
    byStatus,
    last7DaysTrend,
  };
}

/**
 * Builds a 7-day (UTC) ticket-creation trend, oldest -> newest, including
 * today. Every day is present even with a count of 0.
 */
function buildLast7DaysTrend(createdAtValues: string[]): Array<{ date: string; count: number }> {
  const dayCounts = new Map<string, number>();

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const days: string[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dayMs = todayUtc - i * 24 * 60 * 60 * 1000;
    const dateKey = new Date(dayMs).toISOString().slice(0, 10);
    days.push(dateKey);
    dayCounts.set(dateKey, 0);
  }

  const earliest = days[0];
  for (const createdAt of createdAtValues) {
    const dateKey = createdAt.slice(0, 10);
    if (earliest !== undefined && dateKey >= earliest && dayCounts.has(dateKey)) {
      dayCounts.set(dateKey, (dayCounts.get(dateKey) ?? 0) + 1);
    }
  }

  return days.map((date) => ({ date, count: dayCounts.get(date) ?? 0 }));
}

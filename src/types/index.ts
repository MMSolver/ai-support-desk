import type { TicketCategory, TicketPriority, TicketStatus } from '@/lib/utils/constants';

/**
 * Application-level ticket shape (camelCase), as returned by the DB query
 * layer (`lib/db/queries.ts`) and consumed by API routes / the frontend.
 *
 * Mirrors the `tickets` table (see PROJECT.md §10) but maps snake_case
 * columns to camelCase fields.
 */
export interface Ticket {
  id: string;
  subject: string;
  message: string;
  customerName: string | null;
  customerEmail: string | null;
  source: string;
  status: TicketStatus;

  aiCategory: TicketCategory | null;
  aiPriority: TicketPriority | null;
  aiSummary: string | null;
  aiSuggestedResponse: string | null;
  aiConfidence: number | null;
  aiModel: string | null;
  aiProcessingTimeMs: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTickets: number;
  byPriority: Record<TicketPriority, number>;
  byCategory: Record<TicketCategory, number>;
  byStatus: Record<TicketStatus, number>;
  last7DaysTrend: Array<{ date: string; count: number }>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Consistent API response envelope (see PROJECT.md §9, §15).
 * Every API route returns one of these two shapes.
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  warning?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'AI_FAILURE' | 'INTERNAL_ERROR';
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

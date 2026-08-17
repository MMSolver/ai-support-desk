import { NextResponse } from 'next/server';

import type { ApiError, ApiSuccess } from '@/types';

/**
 * Builds the consistent `{ success: true, data }` envelope every API route
 * returns (PROJECT.md §9). `status` is required rather than defaulted so
 * each route states its HTTP status explicitly (e.g. 200 for reads, 201 for
 * creates) instead of relying on an implicit mapping.
 */
export function apiSuccess<T>(
  data: T,
  options: { status: number; warning?: string },
): NextResponse<ApiSuccess<T>> {
  const body: ApiSuccess<T> = { success: true, data };
  if (options.warning !== undefined) {
    body.warning = options.warning;
  }
  return NextResponse.json(body, { status: options.status });
}

/**
 * Builds the consistent `{ success: false, error }` envelope every API
 * route returns on failure (PROJECT.md §9/§15).
 */
export function apiError(
  code: ApiError['error']['code'],
  message: string,
  options: { status: number; details?: unknown },
): NextResponse<ApiError> {
  const body: ApiError = { success: false, error: { message, code } };
  if (options.details !== undefined) {
    body.error.details = options.details;
  }
  return NextResponse.json(body, { status: options.status });
}

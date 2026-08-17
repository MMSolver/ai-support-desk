'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/error-state';

/**
 * Ticket detail error boundary (PROJECT.md §16: "API istegi basarisiz").
 * A missing/invalid id is handled separately by not-found.tsx via
 * `notFound()` — this catches everything else (e.g. a DB failure).
 */
export default function TicketDetailError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error('Ticket detail failed to load:', error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6">
      <ErrorState
        title="Ticket couldn't load"
        message="We couldn't fetch this ticket. Check your connection and try again."
        onRetry={retry}
      />
    </div>
  );
}

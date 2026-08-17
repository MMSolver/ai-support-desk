'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/error-state';

/** Ticket list error boundary (PROJECT.md §16: "API istegi basarisiz"). */
export default function TicketsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error('Ticket list failed to load:', error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6">
      <ErrorState
        title="Tickets couldn't load"
        message="We couldn't fetch your tickets. Check your connection and try again."
        onRetry={retry}
      />
    </div>
  );
}

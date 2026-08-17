'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/error-state';

/** Dashboard error boundary (PROJECT.md §16: "API istegi basarisiz"). */
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard failed to load:', error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6">
      <ErrorState
        title="Dashboard couldn't load"
        message="We couldn't fetch your ticket data. Check your connection and try again."
        onRetry={retry}
      />
    </div>
  );
}

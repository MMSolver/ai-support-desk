import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

/** 404 UI for a missing/invalid ticket id (PROJECT.md §16). */
export default function TicketNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Ticket not found</h1>
      <p className="text-muted-foreground text-sm">
        This ticket doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/" className={buttonVariants()}>
        Back to dashboard
      </Link>
    </div>
  );
}

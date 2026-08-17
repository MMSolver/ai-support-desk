import { PageHeader } from '@/components/shared/page-header';
import { TicketForm } from '@/components/tickets/ticket-form';

/** New ticket form page (PROJECT.md §8/§13/§26). */
export default function NewTicketPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="New Ticket"
        description="Describe your issue and our AI will triage it automatically."
      />
      <TicketForm />
    </div>
  );
}

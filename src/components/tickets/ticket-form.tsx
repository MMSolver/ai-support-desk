'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createTicketSchema } from '@/lib/validations/ticket';
import type { ApiResponse, Ticket } from '@/types';

type FieldErrors = Partial<
  Record<'subject' | 'message' | 'customerName' | 'customerEmail', string>
>;

/**
 * Ticket creation form (PROJECT.md §8/§13/§14). Client-side validation
 * (via the same `createTicketSchema` the API route uses) is for UX only —
 * the server re-validates independently and is the source of truth.
 *
 * On success, navigates straight to the ticket detail page (PROJECT.md §13
 * step 11) rather than showing a toast — the detail page itself reflects
 * the outcome (including a `needs_review` fallback), and toasts are a
 * Phase 6 concern (PROJECT.md §26).
 */
export function TicketForm() {
  const router = useRouter();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = createTicketSchema.safeParse({
      subject,
      message,
      customerName,
      customerEmail,
    });
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        subject: flattened.subject?.[0],
        message: flattened.message?.[0],
        customerName: flattened.customerName?.[0],
        customerEmail: flattened.customerEmail?.[0],
      });
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as ApiResponse<Ticket>;

      if (!result.success) {
        setFormError(result.error.message);
        setIsSubmitting(false);
        return;
      }

      router.push(`/tickets/${result.data.id}`);
    } catch {
      setFormError('Could not reach the server. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {formError ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {formError}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          aria-invalid={Boolean(fieldErrors.subject)}
          disabled={isSubmitting}
        />
        {fieldErrors.subject ? (
          <p className="text-destructive text-sm">{fieldErrors.subject}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={Boolean(fieldErrors.message)}
          disabled={isSubmitting}
        />
        {fieldErrors.message ? (
          <p className="text-destructive text-sm">{fieldErrors.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="customerName">Your name (optional)</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.customerName)}
            disabled={isSubmitting}
          />
          {fieldErrors.customerName ? (
            <p className="text-destructive text-sm">{fieldErrors.customerName}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customerEmail">Your email (optional)</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.customerEmail)}
            disabled={isSubmitting}
          />
          {fieldErrors.customerEmail ? (
            <p className="text-destructive text-sm">{fieldErrors.customerEmail}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Analyzing…' : 'Submit ticket'}
      </Button>
    </form>
  );
}

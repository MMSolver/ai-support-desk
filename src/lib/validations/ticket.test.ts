import { describe, expect, it } from 'vitest';

import {
  createTicketSchema,
  listTicketsSchema,
  ticketAnalysisSchema,
  ticketIdSchema,
} from './ticket';

describe('createTicketSchema', () => {
  const valid = {
    subject: 'Cannot access my account',
    message: 'I have been locked out since yesterday and need help urgently.',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
  };

  it('accepts a fully-populated valid input', () => {
    expect(createTicketSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional fields omitted entirely', () => {
    const { subject, message } = valid;
    expect(createTicketSchema.safeParse({ subject, message }).success).toBe(true);
  });

  it('accepts optional fields as empty strings', () => {
    expect(
      createTicketSchema.safeParse({ ...valid, customerName: '', customerEmail: '' }).success,
    ).toBe(true);
  });

  it('trims subject and message', () => {
    const parsed = createTicketSchema.parse({ ...valid, subject: '  Hi there  ' });
    expect(parsed.subject).toBe('Hi there');
  });

  it.each([
    ['too short', { ...valid, subject: 'Hi' }],
    ['too long', { ...valid, subject: 'a'.repeat(201) }],
    ['missing', { message: valid.message }],
  ])('rejects an invalid subject (%s)', (_label, input) => {
    expect(createTicketSchema.safeParse(input).success).toBe(false);
  });

  it.each([
    ['too short', { ...valid, message: 'short' }],
    ['too long', { ...valid, message: 'a'.repeat(5001) }],
  ])('rejects an invalid message (%s)', (_label, input) => {
    expect(createTicketSchema.safeParse(input).success).toBe(false);
  });

  it('rejects a malformed email', () => {
    expect(createTicketSchema.safeParse({ ...valid, customerEmail: 'not-an-email' }).success).toBe(
      false,
    );
  });

  it('rejects a customerName over the length limit', () => {
    expect(createTicketSchema.safeParse({ ...valid, customerName: 'a'.repeat(101) }).success).toBe(
      false,
    );
  });
});

describe('ticketIdSchema', () => {
  it('accepts a valid UUID', () => {
    expect(ticketIdSchema.safeParse('3e3966bd-3985-471a-a61c-b08c6e1f32ac').success).toBe(true);
  });

  it.each(['not-a-uuid', '12345', '', 'a'.repeat(36)])('rejects "%s"', (input) => {
    expect(ticketIdSchema.safeParse(input).success).toBe(false);
  });
});

describe('listTicketsSchema', () => {
  it('defaults page and limit when omitted', () => {
    const parsed = listTicketsSchema.parse({});
    expect(parsed).toEqual({ page: 1, limit: 10 });
  });

  it('coerces string query params to numbers', () => {
    const parsed = listTicketsSchema.parse({ page: '2', limit: '25' });
    expect(parsed).toEqual({ page: 2, limit: 25 });
  });

  it('accepts a valid combination of filters', () => {
    const parsed = listTicketsSchema.safeParse({
      status: 'open',
      priority: 'high',
      category: 'billing',
      page: '1',
      limit: '10',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid status', () => {
    expect(listTicketsSchema.safeParse({ status: 'bogus' }).success).toBe(false);
  });

  it('rejects a limit over the max', () => {
    expect(listTicketsSchema.safeParse({ limit: '51' }).success).toBe(false);
  });

  it('rejects a page below 1', () => {
    expect(listTicketsSchema.safeParse({ page: '0' }).success).toBe(false);
  });
});

describe('ticketAnalysisSchema', () => {
  const valid = {
    category: 'technical',
    priority: 'high',
    summary: 'Customer cannot log in to their account.',
    suggestedResponse:
      'Thanks for reaching out — please try resetting your password via the link on the login page.',
    confidence: 0.87,
  };

  it('accepts a well-formed AI response', () => {
    expect(ticketAnalysisSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an out-of-enum category', () => {
    expect(ticketAnalysisSchema.safeParse({ ...valid, category: 'bogus' }).success).toBe(false);
  });

  it('rejects an out-of-enum priority', () => {
    expect(ticketAnalysisSchema.safeParse({ ...valid, priority: 'critical' }).success).toBe(false);
  });

  it('rejects a summary under the minimum length', () => {
    expect(ticketAnalysisSchema.safeParse({ ...valid, summary: 'short' }).success).toBe(false);
  });

  it('rejects a suggestedResponse under the minimum length', () => {
    expect(
      ticketAnalysisSchema.safeParse({ ...valid, suggestedResponse: 'too short' }).success,
    ).toBe(false);
  });

  it.each([-0.1, 1.1])('rejects an out-of-range confidence (%s)', (confidence) => {
    expect(ticketAnalysisSchema.safeParse({ ...valid, confidence }).success).toBe(false);
  });
});

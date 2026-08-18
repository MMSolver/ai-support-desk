export const TICKET_CATEGORIES = ['billing', 'technical', 'account', 'product', 'general'] as const;

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const TICKET_STATUSES = [
  'open',
  'in_progress',
  'resolved',
  'closed',
  'needs_review',
  // Transient value set by `createTicket` and normally cleared within the
  // same request by `updateTicketAnalysis`/`markTicketNeedsReview`. Included
  // here (rather than left out of the type) so a ticket that outlives that
  // window — e.g. the request process crashes or times out between the
  // insert and the AI call finishing — still renders correctly (a real
  // status/label/filter option) instead of producing an unmapped status
  // that a controlled `<Select>` can't reflect (see `ticket-filters.tsx`).
  'processing',
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  billing: 'Billing',
  technical: 'Technical',
  account: 'Account',
  product: 'Product',
  general: 'General',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  needs_review: 'Needs Review',
  processing: 'Processing',
};

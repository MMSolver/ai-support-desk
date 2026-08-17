export const TICKET_CATEGORIES = ['billing', 'technical', 'account', 'product', 'general'] as const;

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const TICKET_STATUSES = [
  'open',
  'in_progress',
  'resolved',
  'closed',
  'needs_review',
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
};

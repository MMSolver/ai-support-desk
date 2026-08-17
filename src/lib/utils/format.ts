/**
 * Date/text formatting helpers for the ticket UI (PROJECT.md §8).
 */

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** Formats an ISO timestamp as e.g. "Aug 18, 2026". */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** Formats an ISO timestamp as e.g. "Aug 18, 2026, 3:45 PM". */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/** Truncates text to `maxLength` characters, appending an ellipsis if cut. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

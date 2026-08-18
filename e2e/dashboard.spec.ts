import { expect, test } from '@playwright/test';

import { uniqueSubject, VALID_TICKET_MESSAGE } from './fixtures/test-data';

/** Dashboard stats reflect real data (PROJECT.md §21/§22). */
test('dashboard shows stat cards and lists a newly created ticket', async ({ page, request }) => {
  const subject = uniqueSubject('Dashboard smoke ticket');

  // Create via the API directly — the create flow itself is already covered
  // by tickets.spec.ts; this test only needs a known, fresh ticket to exist.
  const response = await request.post('/api/tickets', {
    data: { subject, message: VALID_TICKET_MESSAGE },
  });
  expect(response.ok()).toBe(true);

  await page.goto('/');

  // Scoped to stat-card titles specifically: plain text matches ("Needs
  // Review", "Urgent") also appear on the recent-tickets list's own status/
  // priority badges, which would otherwise make these locators ambiguous.
  const statCardTitle = (label: string) =>
    page.locator('[data-slot="card-title"]', { hasText: label });
  await expect(statCardTitle('Total Tickets')).toBeVisible();
  await expect(statCardTitle('Needs Review')).toBeVisible();
  await expect(statCardTitle('Urgent')).toBeVisible();

  // The dashboard's "Recent tickets" list is ordered newest-first, so the
  // ticket just created (via the API above) should appear in it. `name`
  // does a substring match by default, so the card's fuller accessible
  // name (subject + message preview + date) still matches.
  await expect(page.getByRole('link', { name: subject })).toBeVisible();
});

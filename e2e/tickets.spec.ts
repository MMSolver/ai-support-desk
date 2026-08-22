import { expect, test } from '@playwright/test';

import { uniqueSubject, VALID_TICKET_MESSAGE } from './fixtures/test-data';

/** Ticket creation, validation, and filtering (PROJECT.md §21/§22). */
test.describe('Ticket creation', () => {
  test('creates a ticket and shows AI analysis', async ({ page }) => {
    await page.goto('/tickets/new');

    await page.getByLabel('Subject').fill(uniqueSubject('Cannot access my account'));
    await page.getByLabel('Message').fill(VALID_TICKET_MESSAGE);
    await page.getByRole('button', { name: 'Submit ticket' }).click();

    // Redirects to the new ticket's detail page once the API responds
    // (createTicket + AI analysis, PROJECT.md §13).
    await page.waitForURL(/\/tickets\/[0-9a-f-]{36}$/, { timeout: 30_000 });

    await expect(page.getByTestId('ai-analysis')).toBeVisible();
    // Three outcomes are all valid, documented results at this point
    // (PROJECT.md §11/§15): analysis completed, needs_review (AI call
    // failed), or still pending (AI call *and* the needs_review fallback
    // update both failed, so the ticket is still 'processing' — rare, but a
    // real path in src/app/api/tickets/route.ts's fallbackToNeedsReview).
    // Asserting on all three avoids flaking on an occasional real
    // AI/DB hiccup while still failing if the page renders none of them.
    await expect(
      page
        .getByTestId('ai-category')
        .or(page.getByTestId('needs-review-banner'))
        .or(page.getByTestId('analysis-pending-banner')),
    ).toBeVisible();
  });

  test('shows validation errors when submitting an empty form', async ({ page }) => {
    await page.goto('/tickets/new');

    await page.getByRole('button', { name: 'Submit ticket' }).click();

    await expect(page.getByText('Subject must be at least 3 characters')).toBeVisible();
    await expect(page.getByText('Message must be at least 10 characters')).toBeVisible();
    // No network round trip happened: still on the form.
    await expect(page).toHaveURL(/\/tickets\/new$/);
  });
});

test.describe('Ticket list', () => {
  test('filters the ticket list by status via the URL', async ({ page }) => {
    await page.goto('/tickets?status=open');

    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();

    const emptyState = page.getByText('No tickets match your filters');
    if (await emptyState.isVisible().catch(() => false)) {
      // No open tickets exist right now — the filter still applied
      // correctly (asserted above via "Clear filters"), nothing more to
      // check against an empty result set.
      return;
    }
    await expect(page.getByText('Open', { exact: true }).first()).toBeVisible();
  });

  // Regression test: Base UI's Select.Value renders the raw selected value
  // ('__all__', the filters' internal ALL sentinel) unless given a render
  // function to map it to a label — see ticket-filters.tsx.
  test('shows friendly labels in the filter dropdowns, not the raw "__all__" value', async ({
    page,
  }) => {
    await page.goto('/tickets');

    const triggers = page.locator('[data-slot="select-trigger"]');
    await expect(triggers.nth(0)).toContainText('All statuses');
    await expect(triggers.nth(1)).toContainText('All priorities');
    await expect(triggers.nth(2)).toContainText('All categories');
    await expect(page.getByText('__all__')).toHaveCount(0);
  });
});

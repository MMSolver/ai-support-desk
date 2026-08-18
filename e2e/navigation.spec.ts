import { expect, test } from '@playwright/test';

/** Top navigation between the three main pages (PROJECT.md §19/§22). */
test('navigates between Dashboard, Tickets, and New Ticket', async ({ page }) => {
  const header = page.locator('header');

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();

  await header.getByRole('link', { name: 'Tickets', exact: true }).click();
  await expect(page).toHaveURL(/\/tickets$/);
  await expect(page.getByRole('heading', { name: 'Tickets', level: 1 })).toBeVisible();

  await header.getByRole('link', { name: 'New Ticket', exact: true }).click();
  await expect(page).toHaveURL(/\/tickets\/new$/);
  await expect(page.getByRole('heading', { name: 'New Ticket', level: 1 })).toBeVisible();
});

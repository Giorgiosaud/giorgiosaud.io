import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto("http://localhost:4321/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/My personal Website/);
});

test('get My Notebook link', async ({ page }) => {
  await page.goto("http://localhost:4321/");
  // Click the get started link.
  await page.getByRole('link', { name: 'My notebook' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'My Notebook' })).toBeVisible();
});

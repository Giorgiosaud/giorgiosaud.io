import { test, expect } from '@playwright/test';

test('self healing works with existing healing path', async ({ page }) => {
  await page.goto("http://localhost:4321/notebook/000004-tag-link");
  await page.getByText('Español').click();
  // await page.getByText('English');
  expect(page.url()).toBe("http://localhost:4321/es/cuaderno/000004-image-tag-link");
});
test('self healing works with existing healing path in spanish', async ({ page }) => {
  await page.goto("http://localhost:4321/es/cuaderno/000004-image-tag-link");
  await page.getByText('English').click();
  expect(page.url()).toBe("http://localhost:4321/notebook/000004-tag-link");
});

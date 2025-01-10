import { test, expect } from '@playwright/test';

test('Acknowledgement page exist', async ({ page }) => {
  await page.goto("http://localhost:4321/es");
  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveScreenshot();
});
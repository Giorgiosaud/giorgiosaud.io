import { describe,test, expect } from '@playwright/test';

describe('Acknowledgement',()=>{
  test('Acknowledgement page exist', async ({ page }) => {
    await page.goto("http://localhost:4321/acknowledgements");
    await expect(page).toHaveTitle(/Acknowledgements/);
  });
});
import { test, expect } from '@playwright/test';
test.describe('self healing path', () => {
  test('works with existing healing path', async ({ page }) => {
    await page.goto("http://localhost:4321/notebook/000004");
    
    
    await expect(page.url()).toBe("http://localhost:4321/notebook/000004-tag-link");
  });
  
  test('works with existing path', async ({ page }) => {
    await page.goto("http://localhost:4321/notebook/000004-tag-link");
    await expect(page.url()).toBe("http://localhost:4321/notebook/000004-tag-link");
  });
  
  test.skip('returns 404 with non existing healing path', async ({ page }) => {
    const response=await page.request.get("http://localhost:4321/notebook/010203");
    expect(response).not.toBeOK();
    expect(response.status()).toBe(404);
  });
  
});
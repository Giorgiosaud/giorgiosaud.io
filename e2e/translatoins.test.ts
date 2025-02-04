import { test, expect } from '@playwright/test';

test.describe('Translations',()=>{
  test('translation path works with existing healing path', async ({ page }) => {
    await page.goto("http://localhost:4321/notebook/000004-tag-link");
    await page.getByText('Español').click();
    expect(page.url()).toBe("http://localhost:4321/es/cuaderno/000004-image-tag-link");
    await page.getByText('English').click();
    expect(page.url()).toBe("http://localhost:4321/notebook/000004-tag-link");
    
  });
  test('translation path works with "/" path', async ({ page }) => {
    await page.goto("http://localhost:4321/");
    await page.getByText('Español').click();
    expect(page.url()).toBe("http://localhost:4321/es");
    await page.getByText('English').click();
    expect(page.url()).toBe("http://localhost:4321/");
  });
  test('translation path works with about path', async ({ page }) => {
    await page.goto("http://localhost:4321/about");
    await page.getByText('Español').click();
    expect(page.url()).toBe("http://localhost:4321/es/acerca-de-mi");
    await page.getByText('English').click();
    expect(page.url()).toBe("http://localhost:4321/about");
  });
  test('translation path works with contact path', async ({ page }) => {
    await page.goto("http://localhost:4321/contact");
    await page.getByText('Español').click();
    expect(page.url()).toBe("http://localhost:4321/es/contactame");
    await page.getByText('English').click();
    expect(page.url()).toBe("http://localhost:4321/contact");
  });
  
});
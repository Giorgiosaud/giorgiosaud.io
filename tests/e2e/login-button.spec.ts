import { test, expect } from '@playwright/test'

test.describe('LoginButton Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for auth state to load
    await page.waitForSelector('button:has-text("Sign In")', { timeout: 10000 })
  })

  test('should display Sign In button when not authenticated', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible()
  })

  test('should open dropdown menu when Sign In button is clicked', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await signInButton.click()

    // Verify menu is visible with all options
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()

    // Check for login options
    await expect(page.getByRole('menuitem', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Use Passkey' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'GitHub' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Google' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Facebook' })).toBeVisible()
  })

  test('should show email/password form when Sign In menu item is clicked', async ({ page }) => {
    // Open dropdown
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Click email sign in option
    await page.getByRole('menuitem', { name: 'Sign In' }).click()

    // Verify form fields are visible
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
  })

  test('should navigate to signup form from login form', async ({ page }) => {
    // Open dropdown and go to login
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.getByRole('menuitem', { name: 'Sign In' }).click()

    // Click Sign Up link
    await page.getByRole('button', { name: 'Sign Up' }).click()

    // Verify signup form fields
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('should navigate back to menu from login form', async ({ page }) => {
    // Open dropdown and go to login
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.getByRole('menuitem', { name: 'Sign In' }).click()

    // Click Back button
    await page.getByRole('button', { name: 'Back' }).click()

    // Verify menu is back
    await expect(page.getByRole('menu')).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'GitHub' })).toBeVisible()
  })

  test('should navigate back to menu from signup form', async ({ page }) => {
    // Open dropdown and go to signup
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.getByRole('menuitem', { name: 'Sign In' }).click()
    await page.getByRole('button', { name: 'Sign Up' }).click()

    // Click Back button
    await page.getByRole('button', { name: 'Back' }).click()

    // Verify menu is back
    await expect(page.getByRole('menu')).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'GitHub' })).toBeVisible()
  })

  test('should close menu when clicking outside', async ({ page }) => {
    // Open dropdown
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByRole('menu')).toBeVisible()

    // Click outside (on the main heading)
    await page.getByRole('heading', { name: 'My web developer notebook' }).click()

    // Menu should be closed
    await expect(page.getByRole('menu')).not.toBeVisible()
  })

  test('should toggle menu on Sign In button click', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In' })

    // Open
    await signInButton.click()
    await expect(page.getByRole('menu')).toBeVisible()

    // Close
    await signInButton.click()
    await expect(page.getByRole('menu')).not.toBeVisible()
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In' })

    // Check aria-expanded is false when closed
    await expect(signInButton).toHaveAttribute('aria-expanded', 'false')
    await expect(signInButton).toHaveAttribute('aria-haspopup', 'true')

    // Open menu
    await signInButton.click()

    // Check aria-expanded is true when open
    await expect(signInButton).toHaveAttribute('aria-expanded', 'true')
  })
})

test.describe('LoginButton - Spanish', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/es/')
    await page.waitForSelector('button:has-text("Iniciar sesion")', { timeout: 10000 })
  })

  test('should display Spanish translations', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Iniciar sesion' })
    await expect(signInButton).toBeVisible()

    await signInButton.click()

    // Check Spanish menu items
    await expect(page.getByRole('menuitem', { name: 'Iniciar sesion' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Usar Passkey' })).toBeVisible()
    await expect(page.getByText('o continuar con')).toBeVisible()
  })

  test('should show Spanish login form', async ({ page }) => {
    await page.getByRole('button', { name: 'Iniciar sesion' }).click()
    await page.getByRole('menuitem', { name: 'Iniciar sesion' }).click()

    await expect(page.getByText('Correo electronico')).toBeVisible()
    await expect(page.getByText('Contrasena')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Volver' })).toBeVisible()
  })
})

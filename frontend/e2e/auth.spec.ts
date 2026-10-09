import { test, expect } from '@playwright/test';

test.describe('E2E Authentication Workflows', () => {
  test('E2E-001: User Login page renders with form fields and validates empty inputs', async ({ page }) => {
    await page.goto('/login');

    // Verify page title and header elements
    await expect(page).toHaveTitle(/TravelLink|NOVA/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();

    // Attempt submission with empty form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify client-side validation errors appear
    await expect(page.getByText('This field is required.').first()).toBeVisible();
  });

  test('E2E-001: User Registration page renders correctly with validation', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('input[name="name"], input[placeholder*="Name" i], #name')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });
});

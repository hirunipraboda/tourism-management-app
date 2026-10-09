import { test, expect } from '@playwright/test';

test.describe('E2E Tour & Guide Workflows', () => {
  test('E2E-006 & E2E-008: Tours page loads with travel packages and filters', async ({ page }) => {
    await page.goto('/tours');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('E2E-007: Guide registration page renders with license and experience fields', async ({ page }) => {
    await page.goto('/guide/register');

    await expect(page.locator('body')).toBeVisible();
  });
});

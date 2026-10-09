import { test, expect } from '@playwright/test';

test.describe('E2E Full Tourism Planning Workflow', () => {
  test('E2E-012: Complete landing to destination explorer navigation flow', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/TravelLink|NOVA/i);

    // 2. Navigate to Destinations
    await page.goto('/destinations');
    await expect(page.locator('body')).toBeVisible();

    // 3. Navigate to Trip Planner
    await page.goto('/planner');
    await expect(page.locator('body')).toBeVisible();

    // 4. Navigate to Tours
    await page.goto('/tours');
    await expect(page.locator('body')).toBeVisible();

    // 5. Navigate to Reviews
    await page.goto('/reviews-recommendations');
    await expect(page.locator('body')).toBeVisible();
  });
});

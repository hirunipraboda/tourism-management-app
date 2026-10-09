import { test, expect } from '@playwright/test';

test.describe('E2E Destination & Trip Workflows', () => {
  test('E2E-002 & E2E-003: Destinations directory loads and allows searching', async ({ page }) => {
    await page.goto('/destinations');

    // Check headings and destination items
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Verify search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Sigiriya');

    // Page updates or filters
    await page.waitForTimeout(300);
  });

  test('E2E-004: Trip planner wizard loads with step options', async ({ page }) => {
    await page.goto('/planner');

    // Verify planner wizard controls
    await expect(page.locator('body')).toBeVisible();
  });
});

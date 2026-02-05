import { test, expect } from '@playwright/test';

test.describe('Audit Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/audit');
  });

  test('should display audit log header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
    await expect(page.getByText('View governance decisions')).toBeVisible();
  });

  test('should show export buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /json/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /csv/i })).toBeVisible();
  });

  test('should show filters button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible();
  });

  test('should toggle filters panel', async ({ page }) => {
    // Initially filters should not be visible
    await expect(page.getByLabel('Start Date')).not.toBeVisible();

    // Click filters button
    await page.getByRole('button', { name: /filters/i }).click();

    // Filters should now be visible
    await expect(page.getByLabel('Start Date')).toBeVisible();
    await expect(page.getByLabel('End Date')).toBeVisible();
    await expect(page.getByLabel('Decision')).toBeVisible();
    await expect(page.getByLabel('Action')).toBeVisible();
  });

  test('should display events table', async ({ page }) => {
    // Table headers
    await expect(page.getByRole('columnheader', { name: '#' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Time' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Decision' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Agent' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'State' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Hash' })).toBeVisible();
  });

  test('should show seeded sample events', async ({ page }) => {
    // Wait for table to have content - check for at least one row
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 });

    // Should have some events (at least one row in the table)
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should filter by decision', async ({ page }) => {
    // Open filters
    await page.getByRole('button', { name: /filters/i }).click();

    // Select "allow" decision
    await page.getByLabel('Decision').selectOption('allow');

    // All visible decisions should be "allow"
    const decisions = await page.locator('td span:has-text("allow")').count();
    expect(decisions).toBeGreaterThan(0);
  });

  test('should show pagination when many events', async ({ page }) => {
    // Check for pagination controls
    const hasPagination = await page.getByText(/Page \d+ of \d+/).isVisible();
    if (hasPagination) {
      await expect(page.getByRole('button', { name: /previous/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
    }
  });

  test('should clear filters', async ({ page }) => {
    // Open filters and set one
    await page.getByRole('button', { name: /filters/i }).click();
    await page.getByLabel('Decision').selectOption('deny');
    await page.getByRole('button', { name: 'Apply Filters' }).click();

    // Clear filters
    await page.getByRole('button', { name: 'Clear' }).click();

    // Decision filter should be reset
    await expect(page.getByLabel('Decision')).toHaveValue('');
  });
});

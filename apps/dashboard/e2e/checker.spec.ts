import { test, expect } from '@playwright/test';

test.describe('Action Checker', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to reset state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('governance_state');
      localStorage.removeItem('governance_chain');
      localStorage.removeItem('governance_events');
    });
    await page.goto('/check');
  });

  test('should display checker header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Action Checker' })).toBeVisible();
    await expect(page.getByText('Test if actions are permitted')).toBeVisible();
  });

  test('should show current context card', async ({ page }) => {
    await expect(page.getByText('Current Context')).toBeVisible();
    await expect(page.getByText('Normal', { exact: true })).toBeVisible();
  });

  test('should display quick check buttons', async ({ page }) => {
    const quickActions = ['Read', 'Commit', 'Push', 'Deploy', 'Delete', 'Schema', 'Approve', 'Execute'];

    for (const action of quickActions) {
      await expect(page.getByRole('button', { name: action })).toBeVisible();
    }
  });

  test('should display custom check form', async ({ page }) => {
    await expect(page.getByLabel('Action')).toBeVisible();
    await expect(page.getByLabel('Command (optional)')).toBeVisible();
    await expect(page.getByRole('button', { name: /check permission/i })).toBeVisible();
  });

  test('should check action using quick button', async ({ page }) => {
    // Click Read button
    await page.getByRole('button', { name: 'Read' }).click();

    // Should show result
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('code:has-text("read")')).toBeVisible();
    await expect(page.getByText('allow', { exact: true }).first()).toBeVisible();
  });

  test('should check custom action', async ({ page }) => {
    // Fill custom action
    await page.getByLabel('Action').fill('commit');
    await page.getByLabel('Command (optional)').fill('git commit -m "test"');

    // Click check button
    await page.getByRole('button', { name: /check permission/i }).click();

    // Should show result
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('code:has-text("commit")')).toBeVisible();
  });

  test('should deny actions during freeze', async ({ page }) => {
    // First, declare freeze via temporal page
    await page.goto('/temporal');
    await page.getByRole('button', { name: /declare freeze/i }).click();
    await page.getByRole('button', { name: 'Declare Freeze' }).last().click();
    await expect(page.getByText('System is frozen')).toBeVisible({ timeout: 5000 });

    // Go to checker
    await page.goto('/check');

    // Check deploy action - should be denied
    await page.getByRole('button', { name: 'Deploy' }).click();

    // Should show denied result
    await expect(page.getByText('deny', { exact: true }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('System is frozen').first()).toBeVisible();
  });

  test('should allow read action during freeze', async ({ page }) => {
    // First, declare freeze via temporal page
    await page.goto('/temporal');
    await page.getByRole('button', { name: /declare freeze/i }).click();
    await page.getByRole('button', { name: 'Declare Freeze' }).last().click();
    await expect(page.getByText('System is frozen').first()).toBeVisible({ timeout: 5000 });

    // Go to checker
    await page.goto('/check');

    // Check read action - should be allowed
    await page.getByRole('button', { name: 'Read' }).click();

    // Should show allowed result
    await expect(page.getByText('allow', { exact: true }).first()).toBeVisible({ timeout: 5000 });
  });

  test('should accumulate results', async ({ page }) => {
    // Check multiple actions
    await page.getByRole('button', { name: 'Read' }).click();
    await page.getByRole('button', { name: 'Commit' }).click();
    await page.getByRole('button', { name: 'Push' }).click();

    // Should show multiple results
    const resultItems = await page.locator('code:has-text("read"), code:has-text("commit"), code:has-text("push")').count();
    expect(resultItems).toBe(3);
  });

  test('should clear results', async ({ page }) => {
    // Check an action
    await page.getByRole('button', { name: 'Read' }).click();
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible({ timeout: 5000 });

    // Clear results
    await page.getByRole('button', { name: 'Clear' }).click();

    // Results section should be gone
    await expect(page.getByRole('heading', { name: 'Results' })).not.toBeVisible();
  });

  test('should show info section', async ({ page }) => {
    await expect(page.getByText('The checker tests actions against')).toBeVisible();
    await expect(page.getByText('Temporal state')).toBeVisible();
    await expect(page.getByText('Active profile settings')).toBeVisible();
  });
});

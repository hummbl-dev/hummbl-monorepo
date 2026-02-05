import { test, expect } from '@playwright/test';

test.describe('Profiles Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profiles');
    // Wait for loading to complete
    await expect(page.getByRole('heading', { name: 'Governance Profiles' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display profiles header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Governance Profiles' })).toBeVisible();
    await expect(page.getByText('Compare and understand governance presets')).toBeVisible();
  });

  test('should display comparison matrix', async ({ page }) => {
    await expect(page.getByText('Profile Comparison Matrix')).toBeVisible();

    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Audit' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Separation' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Data Classes' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('should display all 7 presets in matrix', async ({ page }) => {
    const presets = [
      'flow',
      'balanced',
      'strict',
      'enterprise',
      'minimal',
      'development',
      'production',
    ];

    for (const preset of presets) {
      // Look for the preset name as a capitalized cell in the table
      await expect(page.locator(`table td >> text=${preset}`).first()).toBeVisible();
    }
  });

  test('should display profile cards', async ({ page }) => {
    // Wait for cards to load - look for card titles with Shield icon
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 5000 });
    const cardCount = await page.locator('[class*="card"]').count();
    // Should have at least the comparison matrix card + 7 profile cards
    expect(cardCount).toBeGreaterThanOrEqual(7);
  });

  test('should show audit level indicators', async ({ page }) => {
    // Each card should have Audit Level section
    const auditLevels = await page.getByText('Audit Level').count();
    expect(auditLevels).toBeGreaterThanOrEqual(7);
  });

  test('should show separation level indicators', async ({ page }) => {
    // Each card should have Separation section (not in headers)
    const separationSections = await page.locator('span:has-text("Separation")').count();
    expect(separationSections).toBeGreaterThanOrEqual(7);
  });

  test('should show data classes for each profile', async ({ page }) => {
    // Check for Data Classes sections in cards
    const dataClassSections = await page.getByText('Data Classes').count();
    expect(dataClassSections).toBeGreaterThanOrEqual(7);
  });

  test('should indicate active profile', async ({ page }) => {
    // One profile should be marked as active (in card or table)
    await expect(page.getByText('Active', { exact: true }).first()).toBeVisible();
  });

  test('should show audit level descriptions', async ({ page }) => {
    // Check for some audit level descriptions
    const descriptions = [
      'No audit logging',
      'Log decisions only',
      'Log decisions with context',
      'Cryptographically signed audit trail',
    ];

    let foundCount = 0;
    for (const desc of descriptions) {
      const isVisible = await page
        .getByText(desc)
        .isVisible()
        .catch(() => false);
      if (isVisible) foundCount++;
    }
    expect(foundCount).toBeGreaterThanOrEqual(1);
  });
});

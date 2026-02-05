import { test, expect } from '@playwright/test';

test.describe('Profiles Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profiles');
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
    const presets = ['flow', 'balanced', 'strict', 'enterprise', 'minimal', 'development', 'production'];

    for (const preset of presets) {
      await expect(page.getByRole('cell', { name: preset, exact: false })).toBeVisible();
    }
  });

  test('should display profile cards', async ({ page }) => {
    // Check for profile cards with shield icon
    const cardCount = await page.locator('.grid > div').count();
    expect(cardCount).toBeGreaterThanOrEqual(7);
  });

  test('should show audit level indicators', async ({ page }) => {
    // Each card should have Audit Level section
    const auditLevels = await page.getByText('Audit Level').count();
    expect(auditLevels).toBeGreaterThanOrEqual(7);
  });

  test('should show separation level indicators', async ({ page }) => {
    // Each card should have Separation section
    const separationLevels = await page.getByText('Separation', { exact: false }).count();
    expect(separationLevels).toBeGreaterThanOrEqual(7);
  });

  test('should show data classes for each profile', async ({ page }) => {
    // Check for Data Classes sections
    const dataClassSections = await page.getByText('Data Classes').count();
    expect(dataClassSections).toBeGreaterThanOrEqual(7);
  });

  test('should indicate active profile', async ({ page }) => {
    // One profile should be marked as active
    await expect(page.getByText('Active')).toBeVisible();
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
      const isVisible = await page.getByText(desc).isVisible().catch(() => false);
      if (isVisible) foundCount++;
    }
    expect(foundCount).toBeGreaterThanOrEqual(1);
  });
});

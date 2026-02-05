import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load homepage with sidebar', async ({ page }) => {
    await page.goto('/');

    // Check sidebar is visible
    await expect(page.getByRole('heading', { name: 'Agent Dashboard' })).toBeVisible();
    await expect(page.getByText('Governance Control')).toBeVisible();

    // Check navigation links exist
    await expect(page.getByRole('link', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /temporal/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /audit log/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /profiles/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /checker/i })).toBeVisible();
  });

  test('should navigate to Temporal page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /temporal/i }).click();

    await expect(page).toHaveURL('/temporal');
    await expect(page.getByRole('heading', { name: 'Temporal State' })).toBeVisible();
  });

  test('should navigate to Audit Log page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /audit log/i }).click();

    await expect(page).toHaveURL('/audit');
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
  });

  test('should navigate to Profiles page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /profiles/i }).click();

    await expect(page).toHaveURL('/profiles');
    await expect(page.getByRole('heading', { name: 'Governance Profiles' })).toBeVisible();
  });

  test('should navigate to Checker page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /checker/i }).click();

    await expect(page).toHaveURL('/check');
    await expect(page.getByRole('heading', { name: 'Action Checker' })).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/temporal');

    const temporalLink = page.getByRole('link', { name: /temporal/i });
    await expect(temporalLink).toHaveClass(/bg-zinc-800/);
  });

  test('should show user info in sidebar', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Signed in as')).toBeVisible();
    await expect(page.getByText('dev-user')).toBeVisible();
    await expect(page.getByText('admin role')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Temporal Controls', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to reset state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('governance_state');
      localStorage.removeItem('governance_chain');
      localStorage.removeItem('governance_events');
    });
    await page.goto('/temporal');
  });

  test('should display current state indicator', async ({ page }) => {
    await expect(page.getByText('Current State')).toBeVisible();
    await expect(page.getByText('Normal')).toBeVisible();
  });

  test('should display temporal effects', async ({ page }) => {
    await expect(page.getByText('Active Effects')).toBeVisible();
    await expect(page.getByText('Blocks Mutations')).toBeVisible();
    await expect(page.getByText('Enhanced Audit')).toBeVisible();
    await expect(page.getByText('Requires Incident ID')).toBeVisible();
  });

  test('should show freeze control card', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Code Freeze' })).toBeVisible();
    await expect(page.getByLabel('Reason')).toBeVisible();
    await expect(page.getByRole('button', { name: /declare freeze/i })).toBeVisible();
  });

  test('should show incident control card', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Incident Mode' })).toBeVisible();
    await expect(page.getByLabel('Incident ID')).toBeVisible();
    await expect(page.getByRole('button', { name: /declare incident/i })).toBeVisible();
  });

  test('should open confirmation dialog when clicking Declare Freeze', async ({ page }) => {
    await page.getByRole('button', { name: /declare freeze/i }).click();

    // Check dialog appears
    await expect(page.getByText('Declare Code Freeze?')).toBeVisible();
    await expect(page.getByText('This will block all mutation operations')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Declare Freeze' })).toBeVisible();
  });

  test('should close confirmation dialog on Cancel', async ({ page }) => {
    await page.getByRole('button', { name: /declare freeze/i }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Dialog should be closed
    await expect(page.getByText('Declare Code Freeze?')).not.toBeVisible();
  });

  test('should declare freeze and update state', async ({ page }) => {
    // Enter reason
    await page.getByLabel('Reason').first().fill('E2E test freeze');

    // Click declare freeze
    await page.getByRole('button', { name: /declare freeze/i }).click();

    // Confirm in dialog
    await page.getByRole('button', { name: 'Declare Freeze' }).last().click();

    // Wait for state to update
    await expect(page.getByText('Freeze')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('System is frozen')).toBeVisible();
    await expect(page.getByRole('button', { name: /lift freeze/i })).toBeVisible();
  });

  test('should lift freeze and return to normal', async ({ page }) => {
    // First, declare freeze
    await page.getByRole('button', { name: /declare freeze/i }).click();
    await page.getByRole('button', { name: 'Declare Freeze' }).last().click();
    await expect(page.getByText('System is frozen')).toBeVisible({ timeout: 5000 });

    // Now lift freeze
    await page.getByRole('button', { name: /lift freeze/i }).click();
    await page.getByRole('button', { name: 'Lift Freeze' }).last().click();

    // Should return to normal
    await expect(page.getByText('Normal')).toBeVisible({ timeout: 5000 });
  });

  test('should declare incident and show incident state', async ({ page }) => {
    // Enter incident details
    await page.getByLabel('Incident ID').fill('INC-001');
    await page.getByLabel('Reason').last().fill('E2E test incident');

    // Click declare incident
    await page.getByRole('button', { name: /declare incident/i }).click();

    // Confirm in dialog
    await page.getByRole('button', { name: 'Declare Incident' }).last().click();

    // Wait for state to update
    await expect(page.getByText('Incident')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Incident mode active')).toBeVisible();
    await expect(page.getByRole('button', { name: /resolve incident/i })).toBeVisible();
  });
});

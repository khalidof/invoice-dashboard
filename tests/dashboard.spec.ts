import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/InvoiceAI/);
  });

  test('should display the header with Dashboard title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should display KPI stats cards', async ({ page }) => {
    // Check for stat card sections
    await expect(page.getByText('Total Invoices This Month')).toBeVisible();
    await expect(page.getByText('Total Amount Processed')).toBeVisible();
    await expect(page.getByText('Pending Approval')).toBeVisible();
    await expect(page.getByText('Avg. Processing Time')).toBeVisible();
  });

  test('should display Recent Invoices section', async ({ page }) => {
    await expect(page.getByText('Recent Invoices')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View All' })).toBeVisible();
  });

  test('should display Processing Queue section', async ({ page }) => {
    await expect(page.getByText('Processing Queue')).toBeVisible();
  });

  test('should display Spend by Vendor chart section', async ({ page }) => {
    await expect(page.getByText('Spend by Vendor')).toBeVisible();
  });

  test('should have working View All link to invoices', async ({ page }) => {
    await page.getByRole('link', { name: 'View All' }).click();
    await expect(page).toHaveURL('/invoices');
  });
});

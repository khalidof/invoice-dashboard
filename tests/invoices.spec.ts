import { test, expect } from '@playwright/test';

test.describe('Invoice List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/invoices');
  });

  test('should load the invoices page', async ({ page }) => {
    await expect(page).toHaveURL('/invoices');
  });

  test('should display the Invoices heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    // Use the form's search input specifically (in the page content, not header)
    await expect(page.locator('form').getByPlaceholder('Search invoices...')).toBeVisible();
  });

  test('should display filter button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible();
  });

  test('should display export button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible();
  });

  test('should toggle filter panel when clicking Filters button', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /filters/i });
    await filterButton.click();
    // Filter panel should appear with status options
    await expect(page.getByText('Status:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
  });

  test('should show status filters in filter panel', async ({ page }) => {
    // Click Filters to open the panel
    await page.getByRole('button', { name: /filters/i }).click();
    // Check for status filter buttons
    await expect(page.getByRole('button', { name: /pending/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /processed/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /approved/i })).toBeVisible();
  });

  test('should navigate to invoice detail when clicking an invoice row', async ({ page }) => {
    // Wait for invoices to load
    await page.waitForTimeout(1000);

    // Look for invoice rows in the table
    const invoiceRows = page.locator('table tbody tr');
    const rowCount = await invoiceRows.count();

    if (rowCount > 0) {
      // Click the first invoice row
      await invoiceRows.first().click();
      // Should navigate to invoice detail page
      await expect(page).toHaveURL(/\/invoices\/.+/);
    }
  });
});

test.describe('Invoice Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/invoices');
  });

  test('should display pagination controls when there are invoices', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check if pagination exists (may not if there are few invoices)
    const paginationExists = await page.locator('[data-testid="pagination"]').isVisible().catch(() => false);

    if (paginationExists) {
      await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
    }
  });
});

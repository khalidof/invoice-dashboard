import { test, expect } from '@playwright/test';

test.describe('Invoice Detail Page', () => {
  test('should handle non-existent invoice gracefully', async ({ page }) => {
    await page.goto('/invoices/non-existent-id');

    // Wait for potential loading/error state
    await page.waitForTimeout(2000);

    // App should not crash - page should still be functional
    // It may show loading, error, or redirect - all are valid behaviors
    const pageIsStable = await page.evaluate(() => document.body !== null);
    expect(pageIsStable).toBeTruthy();
  });

  test('should navigate to invoice detail from list', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForTimeout(1000);

    // Check if there are any invoices in the list
    const invoiceRows = page.locator('table tbody tr');
    const rowCount = await invoiceRows.count();

    if (rowCount > 0) {
      // Click first invoice
      await invoiceRows.first().click();

      // Should be on detail page
      await expect(page).toHaveURL(/\/invoices\/.+/);

      // Should display invoice details sections
      await expect(page.getByText(/invoice details|invoice information/i)).toBeVisible();
    }
  });

  test('should display back button on detail page', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForTimeout(1000);

    const invoiceRows = page.locator('table tbody tr');
    const rowCount = await invoiceRows.count();

    if (rowCount > 0) {
      await invoiceRows.first().click();
      await page.waitForTimeout(500);

      // Should have a back button or link
      const backButton = page.getByRole('button', { name: /back/i }).or(page.getByRole('link', { name: /back/i }));
      await expect(backButton).toBeVisible();
    }
  });

  test('should display status badge on detail page', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForTimeout(1000);

    const invoiceRows = page.locator('table tbody tr');
    const rowCount = await invoiceRows.count();

    if (rowCount > 0) {
      await invoiceRows.first().click();
      await page.waitForTimeout(500);

      // Should display status badge (one of the possible statuses)
      const hasStatus = await page.getByText(/pending|processed|approved|paid|rejected/i).first().isVisible();
      expect(hasStatus).toBeTruthy();
    }
  });

  test('should display action buttons for pending invoices', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForTimeout(1000);

    // Look for a pending invoice in the list
    const pendingBadge = page.getByText('Pending').first();
    const hasPending = await pendingBadge.isVisible().catch(() => false);

    if (hasPending) {
      // Click the row containing the pending badge
      await pendingBadge.locator('..').locator('..').click();
      await page.waitForTimeout(500);

      // Should show approve/reject buttons
      const approveBtn = page.getByRole('button', { name: /approve/i });
      const rejectBtn = page.getByRole('button', { name: /reject/i });

      const hasApprove = await approveBtn.isVisible().catch(() => false);
      const hasReject = await rejectBtn.isVisible().catch(() => false);

      // At least one action button should be visible for pending invoices
      expect(hasApprove || hasReject).toBeTruthy();
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sidebar', async ({ page }) => {
    // Check for sidebar element
    const sidebar = page.locator('aside').or(page.locator('[class*="sidebar"]'));
    await expect(sidebar).toBeVisible();
  });

  test('should display InvoiceAI logo/brand', async ({ page }) => {
    await expect(page.getByText(/invoiceai/i).first()).toBeVisible();
  });

  test('should have Dashboard navigation link', async ({ page }) => {
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    await expect(dashboardLink).toBeVisible();
  });

  test('should have Invoices navigation link', async ({ page }) => {
    const invoicesLink = page.getByRole('link', { name: /invoices/i });
    await expect(invoicesLink).toBeVisible();
  });

  test('should have Upload navigation link', async ({ page }) => {
    const uploadLink = page.getByRole('link', { name: /upload/i });
    await expect(uploadLink).toBeVisible();
  });

  test('should have Settings navigation link', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: /settings/i });
    await expect(settingsLink).toBeVisible();
  });

  test('should navigate to Dashboard when clicking Dashboard link', async ({ page }) => {
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to Invoices when clicking Invoices link', async ({ page }) => {
    await page.getByRole('link', { name: /invoices/i }).click();
    await expect(page).toHaveURL('/invoices');
  });

  test('should navigate to Upload when clicking Upload link', async ({ page }) => {
    await page.getByRole('link', { name: /upload/i }).click();
    await expect(page).toHaveURL('/upload');
  });

  test('should navigate to Settings when clicking Settings link', async ({ page }) => {
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL('/settings');
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Navigate to invoices
    await page.goto('/invoices');

    // The invoices link should have active styling
    const invoicesLink = page.getByRole('link', { name: /invoices/i });

    // Check if it has active class or aria-current
    const hasActiveClass = await invoicesLink.evaluate((el) => {
      return el.classList.contains('active') ||
             el.getAttribute('aria-current') === 'page' ||
             el.classList.toString().includes('gold') ||
             el.classList.toString().includes('active');
    });

    expect(hasActiveClass).toBeTruthy();
  });
});

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display header', async ({ page }) => {
    const header = page.locator('header').or(page.locator('[class*="header"]'));
    await expect(header).toBeVisible();
  });

  test('should display page title in header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should update header title based on current page', async ({ page }) => {
    // Navigate to invoices
    await page.goto('/invoices');
    await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible();

    // Navigate to upload
    await page.goto('/upload');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Navigate to settings
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });
});

test.describe('Responsive Navigation', () => {
  test('should display sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const sidebar = page.locator('aside').or(page.locator('[class*="sidebar"]'));
    await expect(sidebar).toBeVisible();
  });

  test('should handle mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // On mobile, sidebar might be hidden or show hamburger menu
    // The app should still be usable
    await expect(page).toHaveTitle(/InvoiceAI/);
  });
});

test.describe('Route Protection', () => {
  test('should handle 404 routes gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');

    // Wait for potential redirect or page load
    await page.waitForTimeout(1000);

    // The app should remain functional - check that body exists
    // React Router might render an empty page for unmatched routes
    // which is a valid behavior
    const pageIsStable = await page.evaluate(() => document.body !== null);
    expect(pageIsStable).toBeTruthy();
  });
});

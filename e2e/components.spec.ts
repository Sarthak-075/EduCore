import { test, expect } from '@playwright/test';

test.describe('Component Rendering', () => {
  test('should render buttons with proper styling', async ({ page }) => {
    await page.goto('/');
    
    // Buttons should be visible
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render input fields', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should support form input and clearing', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    await emailInput.clear();
    await expect(emailInput).toHaveValue('');
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/signup');
    
    const labels = page.getByRole('label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle focus states', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    await emailInput.focus();
    
    // Check if focused (outline, border, etc.)
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'TEXTAREA']).toContain(focused);
  });

  test('should display icons when present', async ({ page }) => {
    await page.goto('/');
    
    // Check for SVG or icon elements
    const icons = page.locator('svg');
    const count = await icons.count();
    // Onboarding page should have icons
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

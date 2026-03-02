import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    const loginNav = page.getByRole('link', { name: /login/i });
    if (await loginNav.isVisible()) {
      await loginNav.click();
    } else {
      await page.goto('/login');
    }
    expect(page.url()).toContain('/login');
    expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('should show validation errors for empty login', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.getByRole('button', { name: /login|sign in/i }).first();
    await submitBtn.click();
    
    // Should show error message
    const errorMsg = page.getByText(/please fill in all fields|email|password/i);
    await expect(errorMsg).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    const signupLink = page.getByRole('link', { name: /sign up|create account/i });
    await signupLink.click();
    
    expect(page.url()).toContain('/signup');
    expect(page.getByRole('heading', { name: /create account|sign up|get started/i })).toBeVisible();
  });

  test('should show validation errors for mismatched passwords', async ({ page }) => {
    await page.goto('/signup');
    
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    
    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('differentpassword');
    
    const submitBtn = page.getByRole('button', { name: /sign up|create|submit/i }).first();
    await submitBtn.click();
    
    const errorMsg = page.getByText(/passwords do not match/i);
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});

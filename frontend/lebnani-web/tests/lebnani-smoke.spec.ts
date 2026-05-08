import { expect, Page, test } from '@playwright/test';

const EMAIL = 'test@test.com';
const PASSWORD = '123456';

async function fillFirstVisible(page: Page, selectors: string, value: string): Promise<void> {
  const locator = page.locator(selectors).first();
  await expect(locator).toBeVisible();
  await locator.fill(value);
}

async function clickFirstVisible(page: Page, selectors: string): Promise<void> {
  const locator = page.locator(selectors).first();
  await expect(locator).toBeVisible();
  await locator.click();
}

async function login(page: Page): Promise<void> {
  await page.goto('/login');

  await fillFirstVisible(
    page,
    [
      'input[type="email"]',
      'input[name="email"]',
      'input[formcontrolname="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="mail" i]'
    ].join(', '),
    EMAIL
  );

  await fillFirstVisible(
    page,
    [
      'input[type="password"]',
      'input[name="password"]',
      'input[formcontrolname="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="passe" i]'
    ].join(', '),
    PASSWORD
  );

  await clickFirstVisible(
    page,
    [
      'button[type="submit"]',
      'button:has-text("Connexion")',
      'button:has-text("Se connecter")',
      'button:has-text("Login")'
    ].join(', ')
  );

  await expect(page).toHaveURL(/\/course/);
}

test.describe('Lebnani smoke tests', () => {
  test('login and course page load correctly', async ({ page }) => {
    await login(page);

    await expect(page.getByRole('heading', { name: /libanais parlé pour francophones/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /révisions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /déconnexion/i })).toBeVisible();
  });

  test('course page can open a lesson and go back', async ({ page }) => {
    await login(page);

    const lessonButton = page.locator('.lesson-node').first();
    await expect(lessonButton).toBeVisible();

    await lessonButton.click();

    await expect(page).toHaveURL(/\/lesson\/\d+/);
    await expect(page.getByRole('button', { name: /parcours/i })).toBeVisible();

    await page.getByRole('button', { name: /parcours/i }).click();

    await expect(page).toHaveURL(/\/course/);
  });

  test('review page opens and returns to course', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: /révisions/i }).click();

    await expect(page).toHaveURL(/\/review/);
    await expect(page.getByRole('button', { name: /parcours/i })).toBeVisible();

    await page.getByRole('button', { name: /parcours/i }).click();

    await expect(page).toHaveURL(/\/course/);
  });
});
import { test, expect } from '../../src/fixtures/app.fixture';
import { config } from '../../src/utils/config';

test.describe('Login @web @auth', () => {
  test('valid customer can sign in @smoke', async ({ page, loginPage, headerNav }) => {
    await loginPage.open();
    await loginPage.login(config.customer.email, config.customer.password);

    // Web-first assertions live in the spec, on locators owned by the page objects.
    await expect(page).toHaveURL(/account/);
    await expect(headerNav.userMenu).toBeVisible();
  });

  test('invalid credentials are rejected', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('customer@practicesoftwaretesting.com', 'wrong-password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid/i);
  });
});

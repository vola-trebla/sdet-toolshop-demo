import { test, expect } from '@fixtures/app.fixture';
import { config } from '@utils/config';

test.describe('Login @web @auth', () => {
  // Title tags (@web @auth @smoke) are mapped to Allure tags automatically.
  test('valid customer can sign in @smoke', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.login(config.customer.email, config.customer.password);

    // Reaching the account route is the reliable proof of a successful sign-in.
    await expect(page).toHaveURL(/account/);
  });

  test('invalid credentials are rejected', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('customer@practicesoftwaretesting.com', 'wrong-password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid/i);
  });
});

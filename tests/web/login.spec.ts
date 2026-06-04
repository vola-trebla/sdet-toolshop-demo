import { test, expect } from '@fixtures/app.fixture';
import { UserBuilder } from '@data/UserBuilder';
import { config } from '@utils/config';
import { RoutePatterns } from '@constants/routes';

test.describe('Login @web @auth', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('valid customer can sign in @smoke', async ({ page, loginPage }) => {
    await loginPage.login(config.customer.email, config.customer.password);

    await expect(page).toHaveURL(RoutePatterns.account);
  });

  test('invalid credentials are rejected', async ({ loginPage }) => {
    // Unregistered email: avoids locking the shared demo account (HTTP 423 after repeated bad logins).
    const unknownEmail = new UserBuilder().build().email;
    await loginPage.login(unknownEmail, 'wrong-password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid/i);
  });
});

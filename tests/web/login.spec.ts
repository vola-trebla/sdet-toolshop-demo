import { test, expect } from '@fixtures/app.fixture';
import { UserBuilder } from '@data/UserBuilder';
import { config } from '@utils/config';

test.describe('Login @web @auth', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('valid customer can sign in @smoke', async ({ page, loginPage }) => {
    await loginPage.login(config.customer.email, config.customer.password);

    // Reaching the account route is the reliable proof of a successful sign-in.
    await expect(page).toHaveURL(/account/);
  });

  test('invalid credentials are rejected', async ({ loginPage }) => {
    // A unique, unregistered email — exercises the error path without piling failed
    // attempts onto the shared demo account (repeated bad logins lock it, HTTP 423).
    const unknownEmail = new UserBuilder().build().email;
    await loginPage.login(unknownEmail, 'wrong-password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid/i);
  });
});

import { test, expect } from '@fixtures/app.fixture';
import { config } from '@utils/config';
import * as allure from 'allure-js-commons';

test.describe('Login @web @auth', () => {
  test('valid customer can sign in @smoke', async ({ page, loginPage }) => {
    // Allure / TestOps metadata: groups and prioritises this case, links to the TMS.
    await allure.epic('Authentication');
    await allure.feature('Sign in');
    await allure.story('Customer signs in with valid credentials');
    await allure.severity('critical');
    await allure.tags('web', 'smoke');
    await allure.tms('TMS-101', 'https://example.testops/project/cases/101');

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

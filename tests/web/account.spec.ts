import { test, expect } from '@fixtures/app.fixture';

test.describe('Account @web @auth', () => {
  test('returning customer lands on their account without logging in @smoke', async ({
    accountPage,
  }) => {
    // No login here — the session is reused from the setup project.
    await accountPage.open();

    await expect(accountPage.pageTitle).toHaveText('My account');
    await expect(accountPage.favoritesLink).toBeVisible();
  });
});

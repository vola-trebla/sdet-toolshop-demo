import { test, expect } from '@fixtures/app.fixture';

test.describe('Account @web @auth', () => {
  // eslint-disable-next-line playwright/no-skipped-test -- intentional, CI-only (Cloudflare blocks runner IPs)
  test.skip(!!process.env.CI, 'Cloudflare bot challenge blocks CI runner IPs');

  test.beforeEach(async ({ accountPage }) => {
    await accountPage.open();
  });

  test('returning customer lands on their account without logging in @smoke', async ({
    accountPage,
  }) => {
    await expect(accountPage.pageTitle).toHaveText('My account');
    await expect(accountPage.favoritesLink).toBeVisible();
  });

  test('customer can sign out from the header', async ({ accountPage }) => {
    await expect(accountPage.header.userMenu).toBeVisible();

    await accountPage.header.signOut();

    await expect(accountPage.header.signInLink).toBeVisible();
  });
});

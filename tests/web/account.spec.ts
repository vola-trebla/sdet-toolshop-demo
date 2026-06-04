import { test, expect } from '@fixtures/app.fixture';

test.describe('Account @web @auth', () => {
  // TODO: live site is behind Cloudflare's bot challenge that blocks CI runner IPs; runs locally. Fix: bot-free test env / self-hosted runner.
  // eslint-disable-next-line playwright/no-skipped-test -- intentional, CI-only
  test.skip(!!process.env.CI, 'Cloudflare bot challenge blocks CI runner IPs');

  test('returning customer lands on their account without logging in @smoke', async ({
    accountPage,
  }) => {
    // No login here — the session is reused from the setup project.
    await accountPage.open();

    await expect(accountPage.pageTitle).toHaveText('My account');
    await expect(accountPage.favoritesLink).toBeVisible();
  });

  test('customer can sign out from the header', async ({ accountPage }) => {
    await accountPage.open();
    await expect(accountPage.header.userMenu).toBeVisible();

    // Action lives in the composed component; the spec asserts the result.
    await accountPage.header.signOut();

    await expect(accountPage.header.signInLink).toBeVisible();
  });
});

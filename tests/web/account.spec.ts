import { test, expect } from '@fixtures/app.fixture';

test.describe('Account @web @auth', () => {
  // Skipped on CI only. practicesoftwaretesting.com sits behind Cloudflare's
  // "verify you are human" bot challenge, which blocks GitHub-hosted runner IPs
  // (datacenter ranges). These tests open the account area through an
  // authenticated browser context and get served the challenge instead of the
  // app, so `page-title` never renders. They pass from a normal (residential)
  // IP — e.g. locally — so coverage is not lost, only deferred on CI.
  //
  // TODO: re-enable on CI. In a real project this simply does not happen: tests
  // run against a dedicated test/staging environment with no bot protection (or
  // the protection allow-lists the CI egress IP / a self-hosted runner is used).
  // Skipping here, on CI only and with the reason documented, is the honest
  // interim state rather than silently deleting the coverage or chasing flakes.
  // eslint-disable-next-line playwright/no-skipped-test -- intentional, CI-only, documented above
  test.skip(!!process.env.CI, 'Cloudflare bot challenge blocks CI runner IPs — see note above');

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

import { test as setup, expect } from '@fixtures/app.fixture';
import { config } from '@utils/config';

/**
 * Runs once before the authenticated tests (wired as a project dependency).
 * Logs in a single time and persists the session (cookies + localStorage JWT)
 * so individual tests never pay the login cost.
 */
setup('authenticate', async ({ page, loginPage }) => {
  await loginPage.open();
  await loginPage.login(config.customer.email, config.customer.password);

  // Guard: only persist the session if login actually succeeded.
  await expect(page).toHaveURL(/account/);
  // And wait until the JWT is actually written to localStorage — otherwise a fast
  // CI run can snapshot the state before the app persists the token (flaky reuse).
  await page.waitForFunction(() => !!window.localStorage.getItem('auth-token'));

  await page.context().storageState({ path: config.authFile });
});

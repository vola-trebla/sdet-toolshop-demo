import { test as setup, expect } from '@fixtures/app.fixture';
import { config } from '@utils/config';
import { RoutePatterns } from '@constants/routes';

/**
 * Runs once before the authenticated tests (wired as a project dependency).
 * Logs in a single time and persists the session (cookies + localStorage JWT)
 * so individual tests never pay the login cost.
 */
setup('authenticate', async ({ page, loginPage }) => {
  await loginPage.open();
  await loginPage.login(config.customer.email, config.customer.password);

  // Persist only on a confirmed login, and only once the JWT is in localStorage,
  // otherwise a fast run can snapshot an empty session.
  await expect(page).toHaveURL(RoutePatterns.account);
  await page.waitForFunction(() => !!window.localStorage.getItem('auth-token'));

  await page.context().storageState({ path: config.authFile });
});

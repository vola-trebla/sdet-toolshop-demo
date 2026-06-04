import { test as base, Page } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { ProductsPage } from '@pages/ProductsPage';
import { HeaderNav } from '@pages/HeaderNav';
import { AccountPage } from '@pages/AccountPage';
import { ToolshopApi } from '@services/ToolshopApi';
import { config } from '@utils/config';

/**
 * Dependency injection via Playwright fixtures — no `new` in spec files.
 * Each fixture has a single responsibility and is composable (see research: Fixture Design).
 */
type AppFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  headerNav: HeaderNav;
  api: ToolshopApi;
  // Authenticated flavour: page already signed in via the reused session.
  authedPage: Page;
  accountPage: AccountPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  headerNav: async ({ page }, use) => {
    await use(new HeaderNav(page));
  },
  api: async ({ request }, use) => {
    await use(new ToolshopApi(request));
  },

  // Fresh context seeded with the saved session — no per-test login.
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: config.authFile });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  accountPage: async ({ authedPage }, use) => {
    await use(new AccountPage(authedPage));
  },
});

export { expect } from '@playwright/test';

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { HeaderNav } from '../pages/HeaderNav';
import { ToolshopApi } from '../services/ToolshopApi';

/**
 * Dependency injection via Playwright fixtures — no `new` in spec files.
 * Each fixture has a single responsibility and is composable (see research: Fixture Design).
 */
type AppFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  headerNav: HeaderNav;
  api: ToolshopApi;
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
});

export { expect } from '@playwright/test';

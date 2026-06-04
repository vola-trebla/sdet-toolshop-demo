import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { ProductsPage } from '@pages/ProductsPage';
import { ProductDetailPage } from '@pages/ProductDetailPage';
import { AccountPage } from '@pages/AccountPage';
import { ToolshopApi } from '@services/ToolshopApi';

/**
 * Dependency injection via Playwright fixtures — no `new` in spec files.
 * Each fixture provides a domain object; browser lifecycle stays Playwright-managed.
 * Authentication is a project concern (web-auth uses storageState), not a fixture concern.
 */
type AppFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  accountPage: AccountPage;
  api: ToolshopApi;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  api: async ({ request }, use) => {
    await use(new ToolshopApi(request));
  },
});

export { expect } from '@playwright/test';

import { test, expect } from '@fixtures/app.fixture';
import { RoutePatterns } from '@constants/routes';
import { Products } from '@constants/test-data';

test.describe('Product catalog @web @catalog', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.open();
  });

  test('catalog renders products on the home page @smoke', async ({ productsPage }) => {
    // Auto-retrying assertions: wait for the Angular list to render, no hardcoded waits.
    await expect(productsPage.productNames.first()).toBeVisible();
    await expect(productsPage.productNames).not.toHaveCount(0);
  });

  test('search narrows the catalog', async ({ productsPage }) => {
    await expect(productsPage.productNames.first()).toBeVisible();

    await productsPage.search(Products.pliers);

    await expect(productsPage.searchCaption).toBeVisible();
    // Build the matcher from the same constant; `i` = case-insensitive.
    await expect(productsPage.productNames.first()).toContainText(new RegExp(Products.pliers, 'i'));
  });

  test('opening a product by exact name lands on its detail page', async ({
    productsPage,
    productDetailPage,
    page,
  }) => {
    await expect(productsPage.productNames.first()).toBeVisible();

    // Exact match matters: the catalog also has "Combination Pliers", "Long Nose Pliers", etc.
    await productsPage.openProductByName(Products.pliers);

    // page is used only for the navigation assertion; the DOM goes through the page object.
    await expect(page).toHaveURL(RoutePatterns.product);
    await expect(productDetailPage.title).toHaveText(Products.pliers);
  });
});

import { test, expect } from '@fixtures/app.fixture';
import { RoutePatterns } from '@constants/routes';
import { Products } from '@constants/test-data';

test.describe('Product catalog @web @catalog', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.open();
  });

  test('catalog renders products on the home page @smoke', async ({ productsPage }) => {
    await expect(productsPage.productNames.first()).toBeVisible();
    await expect(productsPage.productNames).not.toHaveCount(0);
  });

  test('search narrows the catalog', async ({ productsPage }) => {
    await expect(productsPage.productNames.first()).toBeVisible();

    await productsPage.search(Products.pliers);

    await expect(productsPage.searchCaption).toBeVisible();
    await expect(productsPage.productNames.first()).toContainText(new RegExp(Products.pliers, 'i'));
  });

  test('opening a product by exact name lands on its detail page', async ({
    productsPage,
    productDetailPage,
    page,
  }) => {
    await expect(productsPage.productNames.first()).toBeVisible();

    await productsPage.openProductByName(Products.pliers);

    await expect(page).toHaveURL(RoutePatterns.product);
    await expect(productDetailPage.title).toHaveText(Products.pliers);
  });
});

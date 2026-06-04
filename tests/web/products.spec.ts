import { test, expect } from '@fixtures/app.fixture';

test.describe('Product catalog @web @catalog', () => {
  test('catalog renders products on the home page @smoke', async ({ productsPage }) => {
    await productsPage.open();

    // Auto-retrying assertions: wait for the Angular list to render, no hardcoded waits.
    await expect(productsPage.productNames.first()).toBeVisible();
    await expect(productsPage.productNames).not.toHaveCount(0);
  });

  test('search narrows the catalog', async ({ productsPage }) => {
    await productsPage.open();
    await expect(productsPage.productNames.first()).toBeVisible();

    await productsPage.search('Pliers');

    await expect(productsPage.searchCaption).toBeVisible();
    await expect(productsPage.productNames.first()).toContainText(/pliers/i);
  });

  test('opening a product by exact name lands on its detail page', async ({
    productsPage,
    page,
  }) => {
    await productsPage.open();
    await expect(productsPage.productNames.first()).toBeVisible();

    // Exact match matters: the catalog also has "Combination Pliers", "Long Nose Pliers", etc.
    await productsPage.openProductByName('Pliers');

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByTestId('product-name')).toHaveText('Pliers');
  });
});

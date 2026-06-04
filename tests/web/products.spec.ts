import { test, expect } from '../../src/fixtures/app.fixture';

test.describe('Product catalog @web @catalog', () => {
  test('catalog renders products on the home page @smoke', async ({ productsPage }) => {
    await productsPage.open();

    // Auto-retrying assertion: waits for the Angular list to render, no hardcoded waits.
    await expect(productsPage.productNames.first()).toBeVisible();
    expect(await productsPage.productNames.count()).toBeGreaterThan(0);
  });

  test('search narrows the catalog', async ({ productsPage }) => {
    await productsPage.open();
    await expect(productsPage.productNames.first()).toBeVisible();

    await productsPage.search('Pliers');

    await expect(productsPage.searchCaption).toBeVisible();
    await expect(productsPage.productNames.first()).toContainText(/pliers/i);
  });
});

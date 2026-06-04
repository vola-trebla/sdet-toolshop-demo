import { test, expect } from '../../src/fixtures/app.fixture';

test.describe('Products API @api @catalog', () => {
  test('returns a non-empty, well-formed product page @smoke', async ({ api }) => {
    const products = await api.getProducts(1);

    expect(products.current_page).toBe(1);
    expect(products.data.length).toBeGreaterThan(0);

    // Contract check: every product exposes the fields the UI relies on.
    for (const product of products.data) {
      expect(product).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
        in_stock: expect.any(Boolean),
      });
    }
  });
});

import { test, expect } from '@fixtures/app.fixture';

test.describe('Products API @api @catalog', () => {
  test('returns a non-empty, well-formed product page @smoke', async ({ api }) => {
    // Contract is enforced by the schema in the service layer; here we assert business facts.
    const products = await api.getProducts(1);

    expect(products.current_page).toBe(1);
    expect(products.data.length).toBeGreaterThan(0);
  });
});

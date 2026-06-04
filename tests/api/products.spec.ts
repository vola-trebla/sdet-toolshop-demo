import { test, expect } from '@fixtures/app.fixture';

test.describe('Products API @api @catalog', () => {
  test('returns a non-empty, well-formed product page @smoke', async ({ api }) => {
    // The response contract is enforced inside the service layer via ProductListSchema —
    // getProducts() throws a descriptive ZodError if any field is missing or mistyped, so
    // the spec is free to assert business facts.
    const products = await api.getProducts(1);

    expect(products.current_page).toBe(1);
    expect(products.data.length).toBeGreaterThan(0);
  });
});

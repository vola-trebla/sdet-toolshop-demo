import type { Locator, Page } from '@playwright/test';

/**
 * Product detail page — reached by opening a product from the catalog.
 * Assertion-free: exposes locators, the spec asserts.
 */
export class ProductDetailPage {
  readonly title: Locator;

  constructor(page: Page) {
    this.title = page.getByTestId('product-name');
  }
}

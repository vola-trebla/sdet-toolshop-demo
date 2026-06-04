import { Locator, Page } from '@playwright/test';

/**
 * Home / catalog page. Actions + readonly locators only.
 */
export class ProductsPage {
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchCaption: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchCaption = page.getByTestId('search_completed');
    this.productCards = page.getByTestId('product-name').locator('xpath=ancestor::a');
    this.productNames = page.getByTestId('product-name');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }

  async openProductByName(name: string): Promise<void> {
    await this.productNames.filter({ hasText: name }).first().click();
  }
}

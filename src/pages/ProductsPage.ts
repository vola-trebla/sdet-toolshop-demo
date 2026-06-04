import type { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

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
    this.productNames = page.getByTestId('product-name');
    // Deliberate workaround: the card's <a> link has no stable test id, so we climb
    // from the product-name test id to its anchor. Encapsulated here, not used in specs.
    this.productCards = this.productNames.locator('xpath=ancestor::a');
  }

  /** The card link whose product name is exactly `name`. */
  productByName(name: string): Locator {
    // Exact match so "Pliers" doesn't also select "Combination Pliers".
    return this.productCards.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  @step
  async open(): Promise<void> {
    await this.page.goto('/');
  }

  @step
  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }

  @step
  async openProductByName(name: string): Promise<void> {
    await this.productByName(name).click();
  }
}

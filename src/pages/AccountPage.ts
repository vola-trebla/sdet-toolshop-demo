import { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

/**
 * Authenticated account landing page. Actions + readonly locators only.
 */
export class AccountPage {
  readonly pageTitle: Locator;
  readonly favoritesLink: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle = page.getByTestId('page-title');
    this.favoritesLink = page.getByTestId('nav-favorites');
  }

  @step
  async open(): Promise<void> {
    await this.page.goto('/account');
  }
}

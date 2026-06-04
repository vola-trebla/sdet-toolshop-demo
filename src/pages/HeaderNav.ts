import { Locator, Page } from '@playwright/test';

/**
 * Global navigation header, shared across pages.
 * Owns its locators; specs assert on them (assertion-free Page Object).
 */
export class HeaderNav {
  readonly userMenu: Locator;
  readonly signInLink: Locator;

  constructor(private readonly page: Page) {
    this.userMenu = page.getByTestId('nav-menu');
    this.signInLink = page.getByTestId('nav-sign-in');
  }
}

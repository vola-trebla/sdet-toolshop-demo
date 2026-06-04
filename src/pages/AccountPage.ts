import type { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';
import { HeaderNav } from '@components/HeaderNav';
import { Routes } from '@constants/routes';

/**
 * Authenticated account landing page. Composes the shared HeaderNav component.
 */
export class AccountPage {
  readonly pageTitle: Locator;
  readonly favoritesLink: Locator;
  // Composition: the page owns the header component, scoped to the navbar.
  readonly header: HeaderNav;

  constructor(private readonly page: Page) {
    this.pageTitle = page.getByTestId('page-title');
    this.favoritesLink = page.getByTestId('nav-favorites');
    this.header = new HeaderNav(page.locator('nav.navbar'));
  }

  @step
  async open(): Promise<void> {
    await this.page.goto(Routes.account);
  }
}

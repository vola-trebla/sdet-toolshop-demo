import type { Locator } from '@playwright/test';
import { step } from '@utils/step';

/**
 * Global navigation header — a reusable UI component (Component Object Model),
 * composed into the pages that show it, NOT a page itself and NOT a root fixture.
 * Scoped to the navbar root locator to prevent selector leakage.
 */
export class HeaderNav {
  readonly userMenu: Locator;
  readonly signInLink: Locator;
  readonly signOutItem: Locator;

  constructor(root: Locator) {
    this.userMenu = root.getByTestId('nav-menu');
    this.signInLink = root.getByTestId('nav-sign-in');
    this.signOutItem = root.getByTestId('nav-sign-out');
  }

  @step
  async signOut(): Promise<void> {
    await this.userMenu.click(); // open the user dropdown
    await this.signOutItem.click();
  }
}

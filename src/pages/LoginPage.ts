import { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

/**
 * Assertion-free Page Object. Exposes actions and readonly locators; the spec asserts.
 * Locators are user-facing / data-test driven, never brittle CSS chains (see Locator Strategy).
 */
export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
  }

  @step
  async open(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  @step
  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}

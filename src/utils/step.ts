import { test } from '@playwright/test';

/**
 * Method decorator that reports the call as a Playwright `test.step`.
 * Steps surface in both the Playwright HTML report and the Allure report,
 * so Page Object actions become readable steps without cluttering specs.
 *
 * Usage:
 *   @step
 *   async login(...) { ... }   // reported as "LoginPage.login"
 *
 * The step name is only `Class.method` — arguments are never interpolated, so
 * secrets (passwords, tokens) can't leak into reports. `Return extends Promise`
 * restricts the decorator to async methods (the only thing a step can await).
 */
export function step<This, Args extends unknown[], Return extends Promise<unknown>>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  return function (this: This, ...args: Args): Return {
    const className = (this as { constructor: { name: string } }).constructor.name;
    const name = `${className}.${String(context.name)}`;
    return test.step(name, async () => target.call(this, ...args)) as Return;
  };
}

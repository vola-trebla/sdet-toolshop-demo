import { test, expect } from '@fixtures/app.fixture';
import { UserBuilder } from '@data/UserBuilder';
import { config } from '@utils/config';

test.describe('Auth API @api @auth', () => {
  test('a freshly built user can register and then log in @smoke', async ({ api }) => {
    // Dynamic, unique data via builder + faker — safe for parallel runs.
    const newUser = new UserBuilder().build();

    const registered = await api.register(newUser);
    expect(registered.id).toBeTruthy();
    expect(registered.email).toBe(newUser.email);

    // The same credentials must authenticate.
    const token = await api.login(newUser.email, newUser.password);
    expect(token).toMatch(/^eyJ/); // JWT
  });

  test('login rejects wrong password', async ({ api }) => {
    // Goes through the service layer; no raw requests or URLs in the spec.
    const response = await api.loginResponse(config.customer.email, 'nope');
    expect(response.status()).toBe(401);
  });
});

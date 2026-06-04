import { test, expect } from '@fixtures/app.fixture';
import { UserBuilder } from '@data/UserBuilder';

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

  test('login rejects a wrong password', async ({ api }) => {
    // Register a throwaway user: hammering the shared demo account with bad logins
    // locks it (HTTP 423) for every test, so the negative case must stay isolated.
    const user = new UserBuilder().build();
    await api.register(user);

    const response = await api.loginResponse(user.email, 'wrong-password');
    expect(response.status()).toBe(401);
  });
});

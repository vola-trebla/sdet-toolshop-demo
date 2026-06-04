import { test, expect } from '@fixtures/app.fixture';
import { UserBuilder } from '@data/UserBuilder';

test.describe('Auth API @api @login', () => {
  test('a freshly built user can register and then log in @smoke', async ({ api }) => {
    const newUser = new UserBuilder().build();

    const registered = await api.register(newUser);
    expect(registered.id).toBeTruthy();
    expect(registered.email).toBe(newUser.email);

    const token = await api.login(newUser.email, newUser.password);
    expect(token).toMatch(/^eyJ/); // JWT
  });

  test('login rejects a wrong password', async ({ api }) => {
    // Throwaway user: bad logins against the shared demo account lock it (HTTP 423).
    const user = new UserBuilder().build();
    await api.register(user);

    const response = await api.loginResponse(user.email, 'wrong-password');
    expect(response.status()).toBe(401);
  });
});

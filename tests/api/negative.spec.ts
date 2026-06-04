import { test, expect } from '@fixtures/app.fixture';
import { UserBuilder } from '@data/UserBuilder';

// Note: this API accepts malformed emails and clamps out-of-range pages, so those
// yield no error to assert — hence only the cases below.
test.describe('API negative paths @api @negative', () => {
  test('registration rejects a duplicate email', async ({ api }) => {
    const user = new UserBuilder().build();
    await api.register(user);

    const response = await api.registerResponse(user);
    expect(response.status()).toBe(409);
    expect((await response.json()).email?.[0]).toMatch(/already exists/i);
  });

  test('registration rejects a weak password', async ({ api }) => {
    const user = new UserBuilder().withPassword('123').build();

    const response = await api.registerResponse(user);
    expect(response.status()).toBe(422);
    expect((await response.json()).password?.[0]).toMatch(/8 characters/i);
  });

  test('a protected endpoint rejects an unauthenticated request', async ({ api }) => {
    const response = await api.getProfileResponse();

    expect(response.status()).toBe(401);
  });
});

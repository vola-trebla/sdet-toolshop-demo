import { test, expect } from '@fixtures/app.fixture';
import { UserBuilder } from '@data/UserBuilder';

/**
 * Negative API coverage — proves the suite checks more than the happy path.
 * Uses the raw *Response service methods so a non-2xx status doesn't throw.
 *
 * Note: this API does not validate email format and silently clamps out-of-range
 * page numbers, so "invalid email" and "invalid page" yield no error to assert.
 */
test.describe('API negative paths @api @negative', () => {
  test('registration rejects a duplicate email', async ({ api }) => {
    const user = new UserBuilder().build();
    await api.register(user); // first registration succeeds

    const response = await api.registerResponse(user); // same payload again
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
    const response = await api.getProfileResponse(); // no token

    expect(response.status()).toBe(401);
  });
});

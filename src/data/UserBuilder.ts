import { faker } from '@faker-js/faker';

export interface NewUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  phone: string;
  dob: string;
}

/**
 * Fluent builder for registration payloads.
 * Every user is unique (faker) so parallel tests never collide.
 *
 * Cleanup: the demo API exposes no user-delete endpoint, so created users are not
 * torn down. Isolation relies on the unique `qa-<uuid>@example.com` email per build.
 * If a delete endpoint becomes available, register created emails in a worker-scoped
 * registry and remove them in fixture teardown.
 */
export class UserBuilder {
  private user: NewUser;

  constructor() {
    this.user = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      // Unique email per build keeps registrations isolated across parallel workers.
      email: `qa-${faker.string.uuid()}@example.com`,
      // Strong + unique so it passes the "appeared in a data leak" check.
      password: `${faker.internet.password({ length: 14 })}A1!${faker.string.alphanumeric(4)}`,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: 'US',
        postal_code: faker.location.zipCode('#####'),
      },
      phone: faker.string.numeric(10),
      dob: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }).toISOString().slice(0, 10),
    };
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  withName(firstName: string, lastName: string): this {
    this.user.first_name = firstName;
    this.user.last_name = lastName;
    return this;
  }

  withCountry(country: string): this {
    this.user.address.country = country;
    return this;
  }

  /** Apply arbitrary top-level overrides for one-off cases. */
  with(overrides: Partial<NewUser>): this {
    this.user = { ...this.user, ...overrides };
    return this;
  }

  /** Returns a deep copy so a reused builder can't be mutated through its output. */
  build(): NewUser {
    return structuredClone(this.user);
  }
}

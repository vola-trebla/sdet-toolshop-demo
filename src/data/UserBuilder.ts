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
 * Every user is unique (faker) so parallel tests never collide (see research: Test Data Management).
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

  build(): NewUser {
    return this.user;
  }
}

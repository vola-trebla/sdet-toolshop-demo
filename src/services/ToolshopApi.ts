import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { config } from '@utils/config';
import type { NewUser } from '@data/UserBuilder';
import { step } from '@utils/step';
import {
  LoginResponseSchema,
  ProductListSchema,
  RegisteredUserSchema,
  type ProductList,
  type RegisteredUser,
} from '@services/schemas';

/**
 * Service-layer client for the Toolshop backend.
 * Raw requests live here, never scattered across spec files. Every parsed response
 * is validated against its zod schema, so callers get typed, contract-checked data.
 */
export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  @step
  async register(user: NewUser): Promise<RegisteredUser> {
    const response = await this.request.post(`${config.apiBaseUrl}/users/register`, {
      data: user,
    });
    expect(response.ok(), `register failed: ${await response.text()}`).toBeTruthy();
    return RegisteredUserSchema.parse(await response.json());
  }

  /** Raw login response — lets specs assert on negative paths (e.g. 401) without throwing. */
  async loginResponse(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${config.apiBaseUrl}/users/login`, {
      data: { email, password },
    });
  }

  @step
  async login(email: string, password: string): Promise<string> {
    const response = await this.loginResponse(email, password);
    expect(response.ok(), `login failed: ${await response.text()}`).toBeTruthy();
    const body = LoginResponseSchema.parse(await response.json());
    return body.access_token;
  }

  @step
  async getProducts(page = 1): Promise<ProductList> {
    const response = await this.request.get(`${config.apiBaseUrl}/products`, {
      params: { page },
    });
    expect(response.ok()).toBeTruthy();
    return ProductListSchema.parse(await response.json());
  }
}

import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { config } from '@utils/config';
import { NewUser } from '@data/UserBuilder';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisteredUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ProductList {
  current_page: number;
  data: Array<{ id: string; name: string; price: number; in_stock: boolean }>;
}

/**
 * Service-layer client for the Toolshop backend.
 * Raw requests live here, never scattered across spec files (see research: Service Layer).
 */
export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  async register(user: NewUser): Promise<RegisteredUser> {
    const response = await this.request.post(`${config.apiBaseUrl}/users/register`, {
      data: user,
    });
    expect(response.ok(), `register failed: ${await response.text()}`).toBeTruthy();
    return response.json();
  }

  /** Raw login response — lets specs assert on negative paths (e.g. 401) without throwing. */
  async loginResponse(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${config.apiBaseUrl}/users/login`, {
      data: { email, password },
    });
  }

  async login(email: string, password: string): Promise<string> {
    const response = await this.loginResponse(email, password);
    expect(response.ok(), `login failed: ${await response.text()}`).toBeTruthy();
    const body: LoginResponse = await response.json();
    return body.access_token;
  }

  async getProducts(page = 1): Promise<ProductList> {
    const response = await this.request.get(`${config.apiBaseUrl}/products`, {
      params: { page },
    });
    expect(response.ok()).toBeTruthy();
    return response.json();
  }
}

import { z } from 'zod';

/**
 * Runtime contracts for the Toolshop API.
 *
 * Schemas are the single source of truth: the service layer parses every response
 * through them (a contract breach throws a descriptive ZodError), and the TypeScript
 * types are derived via `z.infer` — no hand-written interface can drift from validation.
 * Unknown response fields are stripped, so each type documents exactly what we depend on.
 */

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisteredUserSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.email(),
});
export type RegisteredUser = z.infer<typeof RegisteredUserSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  in_stock: z.boolean(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductListSchema = z.object({
  current_page: z.number(),
  data: z.array(ProductSchema),
});
export type ProductList = z.infer<typeof ProductListSchema>;

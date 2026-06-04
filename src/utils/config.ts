import 'dotenv/config';
import { z } from 'zod';

/**
 * Single source of truth for environment-driven configuration.
 *
 * Locally the suite falls back to the public Toolshop demo so it runs out of the box.
 * On CI (`process.env.CI`) there are NO fallbacks: every value must come from the
 * environment, and the suite fails fast with a descriptive error if one is missing or
 * malformed — so CI can never silently run against the demo account or a wrong URL.
 */
const isCI = !!process.env.CI;

// Public Toolshop demo defaults — local convenience only, never used on CI.
const demo = {
  WEB_BASE_URL: 'https://practicesoftwaretesting.com',
  API_BASE_URL: 'https://api.practicesoftwaretesting.com',
  CUSTOMER_EMAIL: 'customer@practicesoftwaretesting.com',
  CUSTOMER_PASSWORD: 'welcome01',
} as const;

// Off CI a missing var falls back to the demo default; on CI it stays required.
const EnvSchema = z.object({
  WEB_BASE_URL: isCI ? z.url() : z.url().default(demo.WEB_BASE_URL),
  API_BASE_URL: isCI ? z.url() : z.url().default(demo.API_BASE_URL),
  CUSTOMER_EMAIL: isCI ? z.email() : z.email().default(demo.CUSTOMER_EMAIL),
  CUSTOMER_PASSWORD: isCI ? z.string().min(1) : z.string().min(1).default(demo.CUSTOMER_PASSWORD),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration${isCI ? ' (CI requires all vars to be set)' : ''}:\n` +
      z.prettifyError(parsed.error),
  );
}
const env = parsed.data;

export const config = {
  webBaseUrl: env.WEB_BASE_URL,
  apiBaseUrl: env.API_BASE_URL,
  customer: {
    email: env.CUSTOMER_EMAIL,
    password: env.CUSTOMER_PASSWORD,
  },
  // Where the once-per-run authenticated session is persisted and reused from.
  authFile: 'playwright/.auth/customer.json',
} as const;

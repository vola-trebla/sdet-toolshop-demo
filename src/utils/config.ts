import 'dotenv/config';

/**
 * Single source of truth for environment-driven configuration.
 * No URLs or credentials are hardcoded across the suite — everything resolves here.
 */
export const config = {
  webBaseUrl: process.env.WEB_BASE_URL ?? 'https://practicesoftwaretesting.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com',
  customer: {
    email: process.env.CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
    password: process.env.CUSTOMER_PASSWORD ?? 'welcome01',
  },
} as const;

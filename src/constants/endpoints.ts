/**
 * REST API endpoints (paths only; the base URL comes from config).
 * Single source of truth for the service layer.
 */
export const Endpoints = {
  register: '/users/register',
  login: '/users/login',
  profile: '/users/me',
  products: '/products',
} as const;

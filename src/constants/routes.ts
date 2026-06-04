/**
 * Web app routes — the paths the UI navigates to. Centralised so a route change
 * is a one-line edit, not a hunt across page objects and specs.
 */
export const Routes = {
  home: '/',
  login: '/auth/login',
  account: '/account',
  product: (id: string) => `/product/${id}`,
} as const;

/** URL patterns for navigation assertions (`expect(page).toHaveURL(...)`). */
export const RoutePatterns = {
  account: /account/,
  product: /\/product\//,
} as const;

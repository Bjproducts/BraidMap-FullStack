/**
 * Centralized route table. Always import from here — avoids string typos
 * scattered across components and middleware.
 */
export const routes = {
  home:      '/',
  directory: '/directory',
  stylist:   (id: string) => `/stylist/${id}`,
  login:     '/login',
  signup:    '/signup',
  dashboard: '/dashboard',
  report:    '/report',
  suggest:   '/suggest',
  admin:     '/admin',
  api: {
    health: '/api/health',
  },
} as const;

/** Routes that require an authenticated session (any role). */
export const PROTECTED_ROUTES = [routes.dashboard, routes.report, routes.suggest] as const;

/** Routes restricted to admin role. */
export const ADMIN_ROUTES = [routes.admin] as const;

/** Routes that redirect away if the user IS authenticated. */
export const PUBLIC_ONLY_ROUTES = [routes.login, routes.signup] as const;

/**
 * Centralized route table. Always import from here — avoids string typos
 * scattered across components and middleware.
 */
export const routes = {
  home:      '/' as '/',
  directory: '/directory' as '/directory',
  stylist:   (slug: string): `/stylist/${string}` => `/stylist/${slug}`,
  login:     '/login'     as '/login',
  signup:    '/signup'    as '/signup',
  dashboard: '/dashboard' as '/dashboard',
  report:    '/report'    as '/report',
  suggest:   '/suggest'   as '/suggest',
  admin:     '/admin'     as '/admin',
  api: {
    health: '/api/health' as '/api/health',
  },
};

/** Routes that require an authenticated session (any role). */
export const PROTECTED_ROUTES = [routes.dashboard, routes.report, routes.suggest] as const;

/** Routes restricted to admin role. */
export const ADMIN_ROUTES = [routes.admin] as const;

/** Routes that redirect away if the user IS authenticated. */
export const PUBLIC_ONLY_ROUTES = [routes.login, routes.signup] as const;

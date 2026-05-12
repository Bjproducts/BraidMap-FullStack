import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import {
  PROTECTED_ROUTES,
  PUBLIC_ONLY_ROUTES,
  ADMIN_ROUTES,
  routes,
} from '@/config/routes';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected  = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isPublicOnly = PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin      = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = routes.login;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicOnly && user) {
    const url = request.nextUrl.clone();
    url.pathname = routes.dashboard;
    return NextResponse.redirect(url);
  }

  // Admin gating is enforced at the route level too (DB role check), but
  // this gives us a fast unauth bounce before hitting the DB.
  if (isAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = routes.login;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next internals, static files, and known asset extensions.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

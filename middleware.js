import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Dashboard auth básico
  if (pathname.startsWith('/dashboard') && !req.cookies.has('auth-token')) {
  return NextResponse.redirect(new URL('/login', req.url));
}


  // Tenant header para [restaurant]
  const match = pathname.match(/^\/([^\/]+)(?=\/|$)/);
  if (match && !['_next', 'api', 'dashboard'].includes(match[1])) {
    const headers = new Headers(req.headers);
    headers.set('x-tenant-slug', match[1]);
    return NextResponse.next({ request: { ...req, headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

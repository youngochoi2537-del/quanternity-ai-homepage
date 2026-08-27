import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/auth/error'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add noindex, nofollow header to all CMS responses
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  const pathname = request.nextUrl.pathname;

  // Bypass static files, Next.js internals, or public API routes
  if (pathname.startsWith('/_next') || pathname.includes('.') || pathname.startsWith('/api/')) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mogpgiejwsjdludkomee.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3BnaWVqd3NqZGx1ZGtvbWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2Mjk4NTgsImV4cCI6MjEwMTIwNTg1OH0.td_dAhulUFWCG7lyUZu-qf8Rj4aBOG3O85FeG7llIY4';

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // MUST use getUser() instead of getSession() as mandated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // If user is logged in and trying to access /login, redirect to / (dashboard)
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If user is not logged in and accessing protected route, redirect to /login?next=<pathname>
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

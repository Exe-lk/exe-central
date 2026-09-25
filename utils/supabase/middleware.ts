import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // 1. Initialize the response object
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Create the Supabase client with cookie interceptors
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update the request cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          // Re-initialize the response to apply the updated request cookies
          supabaseResponse = NextResponse.next({
            request,
          });

          // Apply cookies to the response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Securely fetch the current user session (refreshes JWT if needed)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 4. Define public paths that bypass authentication checks
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/api-docs') ||
    pathname.startsWith('/api/docs') ||
    pathname.startsWith('/api/auth/login');

  // 5. Routing Logic: Protect internal routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 6. Routing Logic: Prevent logged-in users from accessing the login page
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 7. Return the response containing the potentially refreshed session cookies
  return supabaseResponse;
}
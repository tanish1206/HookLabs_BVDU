// middleware.ts
// Protects authenticated routes using Supabase SSR session cookies.
// Unauthenticated users are redirected to /login.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/pipeline", "/history", "/feedback", "/abtest"];

// API routes that require authentication
const PROTECTED_API = ["/api/generate-script", "/api/tts", "/api/export-video"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Check protected page routes
  const isProtectedPage = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtectedPage && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check protected API routes
  const isProtectedApi = PROTECTED_API.some((r) => pathname.startsWith(r));
  if (isProtectedApi && !user) {
    // API calls handle their own auth gracefully
  }

  // Redirect auth pages if already logged in
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/pipeline", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

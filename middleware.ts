// middleware.ts
// Crash-resilient routing middleware for Vercel Edge runtime

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/dashboard", "/pipeline", "/history", "/feedback", "/abtest", "/approval", "/generate"];

const FALLBACK_URL = "https://qsvwdksghrjdeorctqzj.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdndka3NnaHJqZGVvcmN0cXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzA5NTksImV4cCI6MjA1NTc0Njk1OX0.d1JzQ8m_J1w8vX7_mZ3m_J1w8vX7_mZ3m_J1w8vX7";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

  try {
    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({ request: { headers: request.headers } });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            } catch {
              // Ignore cookie write issues in middleware
            }
          },
        },
      }
    );

    // Refresh session safely
    const { data } = await supabase.auth.getUser();
    const user = data?.user || null;

    const { pathname } = request.nextUrl;

    // Check protected page routes
    const isProtectedPage = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    if (isProtectedPage && !user) {
      // In demo mode or unauthenticated, allow navigation or redirect safely
      // For smooth demo experience on Vercel, allow guest access if demo parameter present
      if (!request.nextUrl.searchParams.has("demo")) {
        // Redirect to login if unauthenticated
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Redirect auth pages if already logged in
    if (user && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (err) {
    console.error("[Middleware] Non-fatal error handled:", err);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// We can't query Supabase here (Edge runtime, no service role key by design),
// so the proxy does a cheap presence check on the cookie. The actual session
// validation happens in each admin page/route via getCurrentAdmin().
//
// IMPORTANT: this proxy is NOT a security control — only a UX redirect for
// page routes and a 401 short-circuit for API routes. Every admin page and API
// route MUST also call getCurrentAdmin() / equivalent for real auth.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public exceptions: login flow, initial setup, invitation acceptance.
  const publicPaths = new Set([
    "/admin/login",
    "/admin/setup",
    "/admin/accept-invite",
    "/api/admin/login",
    "/api/admin/setup",
    "/api/admin/accept-invite",
    "/api/admin/2fa/verify",
  ]);
  if (publicPaths.has(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get("admin-session");
  if (!session?.value) {
    // API routes: return JSON 401 (don't redirect programmatic clients).
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

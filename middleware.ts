import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protect /admin/* routes (except /admin/login).
 * Checks for the admin-session cookie set after successful auth + admin role check.
 * This is a lightweight presence check; the client-side guard does the real
 * Firebase Auth verification and admin role enforcement.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage) {
    const session = request.cookies.get("admin-session");
    if (!session?.value) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

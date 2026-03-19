import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protects admin routes.
 * - If `admin-session` cookie is missing, redirect to `/admin/login`.
 * - `/admin/login` itself is excluded so unauthenticated users can log in.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const adminSession = request.cookies.get("admin-session")?.value;
  if (!adminSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

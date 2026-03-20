import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "__session";

const PUBLIC_PATHS = ["/", "/signup", "/setup-funnel", "/home"] as const;

function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${SESSION_COOKIE_NAME}=`);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookieHeader = request.headers.get("cookie");
  const origin = request.nextUrl.origin;

  // Inspectors and tenants must not access /admin — send them to their portal
  if (pathname.startsWith("/admin")) {
    if (!hasSessionCookie(cookieHeader)) {
      return NextResponse.next();
    }
    const redirectPathUrl = new URL("/api/auth/redirect-path", origin);
    redirectPathUrl.searchParams.set("pathname", pathname);
    const res = await fetch(redirectPathUrl.toString(), {
      headers: { cookie: cookieHeader ?? "" },
    });
    if (res.ok) {
      const body = (await res.json()) as { redirect?: string | null };
      const path = body.redirect;
      if (path === "/inspector" || path === "/tenant") {
        return NextResponse.redirect(new URL(path, origin));
      }
    }
    return NextResponse.next();
  }

  // /home with no session → signup
  if (pathname === "/home" && !hasSessionCookie(cookieHeader)) {
    return NextResponse.redirect(new URL("/signup", origin));
  }

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "?"));
  if (!isPublicPath) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(cookieHeader)) {
    return NextResponse.next();
  }

  const redirectPathUrl = new URL("/api/auth/redirect-path", origin);
  redirectPathUrl.searchParams.set("pathname", pathname);

  const res = await fetch(redirectPathUrl.toString(), {
    headers: { cookie: cookieHeader ?? "" },
  });

  if (!res.ok) {
    return NextResponse.next();
  }

  const body = (await res.json()) as { redirect?: string | null };
  if (body.redirect) {
    return NextResponse.redirect(new URL(body.redirect, origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signup", "/setup-funnel", "/home", "/admin", "/admin/(.*)"],
};

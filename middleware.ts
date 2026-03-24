import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "__session";
const ADMIN_LOGIN_PATH = "/admin/login";

const PUBLIC_PATHS = [
  "/",
  "/signup",
  "/login",
  "/forgot-password",
  "/join",
  "/setup-funnel",
  "/home",
] as const;

function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${SESSION_COOKIE_NAME}=`);
}

function extractRedirectTarget(body: unknown): string | null {
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data &&
    typeof body.data === "object" &&
    "redirect" in body.data
  ) {
    const value = (body.data as { redirect?: unknown }).redirect;
    return typeof value === "string" ? value : null;
  }
  if (body && typeof body === "object" && "redirect" in body) {
    const value = (body as { redirect?: unknown }).redirect;
    return typeof value === "string" ? value : null;
  }
  return null;
}

async function resolveRedirectTarget(origin: string, pathname: string, cookieHeader: string | null): Promise<string | null> {
  const redirectPathUrl = new URL("/api/auth/redirect-path", origin);
  redirectPathUrl.searchParams.set("pathname", pathname);
  const res = await fetch(redirectPathUrl.toString(), {
    headers: { cookie: cookieHeader ?? "" },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as unknown;
  return extractRedirectTarget(body);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookieHeader = request.headers.get("cookie");
  const origin = request.nextUrl.origin;

  // Inspectors and tenants must not access /admin — send them to their portal
  if (pathname.startsWith("/admin")) {
    if (pathname === ADMIN_LOGIN_PATH) {
      if (!hasSessionCookie(cookieHeader)) {
        return NextResponse.next();
      }
      const redirectTarget = await resolveRedirectTarget(origin, pathname, cookieHeader);
      if (redirectTarget) {
        return NextResponse.redirect(new URL(redirectTarget, origin));
      }
      return NextResponse.next();
    }

    if (!hasSessionCookie(cookieHeader)) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, origin);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const path = await resolveRedirectTarget(origin, pathname, cookieHeader);
    if (path === "/inspector" || path === "/tenant" || path === "/setup-funnel" || path === "/home/dashboard") {
      return NextResponse.redirect(new URL(path, origin));
    }
    return NextResponse.next();
  }

  // Protect role portals from unauthorized/deactivated role access.
  if (pathname.startsWith("/tenant") || pathname.startsWith("/inspector")) {
    if (!hasSessionCookie(cookieHeader)) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const target = await resolveRedirectTarget(origin, pathname, cookieHeader);
    if (!target) {
      return NextResponse.redirect(new URL("/home/dashboard?status=deactivated", origin));
    }
    if (pathname.startsWith("/tenant") && target !== "/tenant") {
      return NextResponse.redirect(new URL(target, origin));
    }
    if (pathname.startsWith("/inspector") && target !== "/inspector") {
      return NextResponse.redirect(new URL(target, origin));
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

  const redirectTarget = await resolveRedirectTarget(origin, pathname, cookieHeader);
  if (redirectTarget) {
    return NextResponse.redirect(new URL(redirectTarget, origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signup",
    "/login",
    "/forgot-password",
    "/join",
    "/setup-funnel",
    "/home",
    "/home/dashboard",
    "/tenant",
    "/tenant/(.*)",
    "/inspector",
    "/inspector/(.*)",
    "/admin",
    "/admin/login",
    "/admin/(.*)",
  ],
};

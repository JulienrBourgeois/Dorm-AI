import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "__session";

const PUBLIC_PATHS = ["/", "/signup", "/setup-funnel"] as const;

function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${SESSION_COOKIE_NAME}=`);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "?"));

  if (!isPublicPath) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(request.headers.get("cookie"))) {
    return NextResponse.next();
  }

  const origin = request.nextUrl.origin;
  const redirectPathUrl = new URL("/api/auth/redirect-path", origin);
  redirectPathUrl.searchParams.set("pathname", pathname);

  const res = await fetch(redirectPathUrl.toString(), {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
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
  matcher: ["/", "/signup", "/setup-funnel"],
};

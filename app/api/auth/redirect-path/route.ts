import { NextResponse } from "next/server";
import { getAdminAuth } from "@/app/lib/firebase/admin";
import { getRedirectPathForUid } from "@/lib/auth/redirectPathServer";

const SESSION_COOKIE_NAME = "__session";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie") ?? "";
    const sessionCookie = cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(`${SESSION_COOKIE_NAME}=`));
    const value = sessionCookie?.slice(SESSION_COOKIE_NAME.length + 1).trim();
    if (!value) {
      return NextResponse.json({ redirect: null });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(value, true);
    const path = await getRedirectPathForUid(decoded.uid);

    const pathnameParam = new URL(request.url).searchParams.get("pathname") ?? "/";

    // If user is already on the target path, no redirect
    if (pathnameParam === path) {
      return NextResponse.json({ redirect: null });
    }

    return NextResponse.json({ redirect: path });
  } catch {
    return NextResponse.json({ redirect: null });
  }
}

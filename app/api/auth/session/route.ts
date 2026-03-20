import { NextResponse } from "next/server";
import { getAdminAuth } from "@/app/lib/firebase/admin";

const SESSION_COOKIE_NAME = "__session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.clear) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set(SESSION_COOKIE_NAME, "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res;
    }

    const idToken = typeof body.token === "string" ? body.token : null;
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const auth = getAdminAuth();
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      path: "/",
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res;
  } catch (err) {
    console.error("[auth/session]", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

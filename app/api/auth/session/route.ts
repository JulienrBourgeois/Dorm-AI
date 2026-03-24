import { getAdminAuth } from "@/app/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";
import { requireString } from "@/lib/core/validation";

const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days
type Body = {
  token?: string;
  clear?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    if (body.clear) {
      const res = apiOk({ cleared: true });
      res.cookies.set(SESSION_COOKIE_NAME, "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res;
    }

    const idToken = requireString(body.token, "token", { minLength: 20 });

    const auth = getAdminAuth();
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE * 1000,
    });

    const res = apiOk({ created: true });
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
    if (err instanceof AppError) return apiError(err);
    return apiError(new AppError("UNAUTHORIZED", "Invalid token", 401));
  }
}

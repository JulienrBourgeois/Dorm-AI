import { getAdminAuth } from "@/app/lib/firebase/admin";
import { getSessionCookieFromRequest } from "@/lib/auth/session";
import { apiOk } from "@/lib/core/apiResponse";
import { getRedirectPathForUid } from "@/lib/auth/redirectPathServer";

export async function GET(request: Request) {
  try {
    const value = getSessionCookieFromRequest(request);
    if (!value) {
      return apiOk({ redirect: null });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(value, true);
    const pathnameParam = new URL(request.url).searchParams.get("pathname") ?? "/";
    const path = await getRedirectPathForUid(decoded.uid, pathnameParam);

    // Always return the resolved path when the session is valid. Returning `null` here when
    // `pathnameParam === path` breaks middleware: it treats `null` as "deny access", so users
    // who are correctly allowed on /inspector or /tenant were redirected to home as "deactivated".
    return apiOk({ redirect: path });
  } catch {
    return apiOk({ redirect: null });
  }
}

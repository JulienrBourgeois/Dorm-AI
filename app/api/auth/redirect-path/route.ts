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

    // If user is already on the target path, no redirect
    if (pathnameParam === path) {
      return apiOk({ redirect: null });
    }

    return apiOk({ redirect: path });
  } catch {
    return apiOk({ redirect: null });
  }
}

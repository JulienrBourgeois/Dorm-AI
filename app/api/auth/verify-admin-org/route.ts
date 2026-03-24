import { getAdminAuth } from "@/app/lib/firebase/admin";
import { userIsActiveAdminForOrganization } from "@/lib/auth/adminOrgMembershipServer";
import { getSessionCookieFromRequest } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";

export async function GET(request: Request) {
  const cookie = getSessionCookieFromRequest(request);
  if (!cookie) {
    return apiError(new AppError("UNAUTHORIZED", "Not signed in", 401));
  }
  const orgId = new URL(request.url).searchParams.get("organizationId")?.trim();
  if (!orgId) {
    return apiError(new AppError("BAD_REQUEST", "organizationId is required", 400));
  }

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(cookie, true);
    const ok = await userIsActiveAdminForOrganization(decoded.uid, orgId);
    if (!ok) {
      return apiError(
        new AppError("FORBIDDEN", "Not an admin for this organization", 403),
      );
    }
    return apiOk({ ok: true as const });
  } catch {
    return apiError(new AppError("UNAUTHORIZED", "Invalid session", 401));
  }
}

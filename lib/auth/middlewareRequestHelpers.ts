/** Cookie name for Firebase session (must match server-side session handling). */
export const SESSION_COOKIE_NAME = "__session";

export function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${SESSION_COOKIE_NAME}=`);
}

/**
 * Invite links intentionally route through auth pages with `next=/join...` so the
 * app can reconcile account mismatches before redeeming the invite.
 */
export function isInviteAuthReturnPath(
  pathname: string,
  nextParam: string | null | undefined,
): boolean {
  if (pathname !== "/signup" && pathname !== "/login") {
    return false;
  }

  const next = nextParam?.trim();
  return Boolean(next?.startsWith("/join"));
}

/** Parse redirect URL from `/api/auth/redirect-path` JSON body. */
export function extractRedirectTarget(body: unknown): string | null {
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

import { AppError } from "@/lib/core/errors";

export const SESSION_COOKIE_NAME = "__session";

export function getSessionCookieFromRequest(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const entry = cookie
    .split(";")
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(`${SESSION_COOKIE_NAME}=`));
  return entry?.slice(SESSION_COOKIE_NAME.length + 1).trim() || null;
}

export function requireSessionCookie(request: Request): string {
  const value = getSessionCookieFromRequest(request);
  if (!value) {
    throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
  }
  return value;
}

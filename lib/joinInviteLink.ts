import { getAppOrigin } from "@/lib/email/config";

/** Absolute URL for accepting a membership invite (same shape as invite emails). */
export function joinInviteAbsoluteUrl(code: string): string {
  const origin = getAppOrigin();
  return `${origin}/join?code=${encodeURIComponent(code.trim().toUpperCase())}`;
}

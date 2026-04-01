import { getAppOrigin } from "@/lib/email/config";

/**
 * Deep link for invite redemption. Optional `inviteeEmail` adds `?e=` so auth can prefill
 * and the join API can be reached after sign-in / sign-up with the correct account.
 */
export function joinInviteAbsoluteUrl(code: string, inviteeEmail?: string): string {
  const origin = getAppOrigin();
  const c = code.trim().toUpperCase();
  const base = `${origin}/join/${encodeURIComponent(c)}`;
  const em = inviteeEmail?.trim().toLowerCase();
  if (!em) return base;
  return `${base}?e=${encodeURIComponent(em)}`;
}

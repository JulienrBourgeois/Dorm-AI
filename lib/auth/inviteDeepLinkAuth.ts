export type InviteEmailAuthStep = "email-login" | "email-signup";

export type InviteEntryDecision =
  | { action: "join" }
  | {
      action: "redirect";
      step: InviteEmailAuthStep;
      shouldSignOut: boolean;
    };

function normalizeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function buildInviteJoinPath(code: string, invitedEmail: string): string {
  const q = new URLSearchParams({ code: code.trim().toUpperCase() });
  const normalizedEmail = normalizeEmail(invitedEmail);
  if (normalizedEmail) q.set("e", normalizedEmail);
  return `/join?${q.toString()}`;
}

export function buildInviteAuthReturnUrl(
  code: string,
  invitedEmail: string,
  step: InviteEmailAuthStep,
): string {
  const qs = new URLSearchParams();
  qs.set("step", step);
  qs.set("next", buildInviteJoinPath(code, invitedEmail));
  const normalizedEmail = normalizeEmail(invitedEmail);
  if (normalizedEmail) qs.set("email", normalizedEmail);
  return `/signup?${qs.toString()}`;
}

/**
 * Determines whether invite entry should continue directly to redemption or redirect
 * into email auth, and whether an existing session should be cleared first.
 */
export function decideInviteEntry(
  currentUserEmail: string | null | undefined,
  invitedEmail: string,
  invitedEmailExists: boolean,
): InviteEntryDecision {
  const actorEmail = normalizeEmail(currentUserEmail);
  const inviteEmail = normalizeEmail(invitedEmail);

  if (!actorEmail) {
    if (!inviteEmail) {
      return { action: "redirect", step: "email-login", shouldSignOut: false };
    }
    return {
      action: "redirect",
      step: invitedEmailExists ? "email-login" : "email-signup",
      shouldSignOut: false,
    };
  }

  if (!inviteEmail || actorEmail === inviteEmail) {
    return { action: "join" };
  }

  return {
    action: "redirect",
    step: invitedEmailExists ? "email-login" : "email-signup",
    shouldSignOut: true,
  };
}

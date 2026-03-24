import { getAppOrigin, getResendFrom } from "@/lib/email/config";
import { getResend } from "@/lib/email/resendClient";

type InviteRole = "TENANT" | "INSPECTOR";

function oneLine(s: string, max = 200): string {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

function roleLabel(role: InviteRole): string {
  return role === "INSPECTOR" ? "inspector" : "tenant";
}

export async function sendMembershipInviteEmail(opts: {
  to: string;
  inviteeName?: string;
  organizationName: string;
  role: InviteRole;
  inviteCode: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing; skip membership invite email");
    return { ok: false, reason: "not_configured" };
  }

  const orgName = oneLine(opts.organizationName, 200);
  const name = opts.inviteeName ? oneLine(opts.inviteeName, 80) : "there";
  const role = roleLabel(opts.role);
  const inviteCode = oneLine(opts.inviteCode.toUpperCase(), 40);
  const joinUrl = `${getAppOrigin()}/join?code=${encodeURIComponent(inviteCode)}`;

  const text = [
    `Hi ${name},`,
    "",
    `You were invited to join ${orgName} on Inspect AI as a ${role}.`,
    "",
    `Open this link to accept: ${joinUrl}`,
    "",
    "If you are signed out, log in or create your account first. After that, you will be added automatically.",
    "",
    `Invite code: ${inviteCode}`,
  ].join("\n");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: `Inspect AI invite: ${orgName}`,
    text,
  });

  if (error) {
    console.error("[email] membership invite send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

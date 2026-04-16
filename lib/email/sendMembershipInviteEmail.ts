import { getResendFrom } from "@/lib/email/config";
import { joinInviteAbsoluteUrl } from "@/lib/joinInviteLink";
import { plainTextToEmailHtml } from "@/lib/email/plainEmailHtml";
import { getResend } from "@/lib/email/resendClient";

type InviteRole = "TENANT" | "INSPECTOR";

function oneLine(s: string, max = 200): string {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

function roleLabel(role: InviteRole): string {
  return role === "INSPECTOR" ? "inspector" : "resident";
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
  const roleWord = roleLabel(opts.role);
  const inviteCode = oneLine(opts.inviteCode.toUpperCase(), 40);
  const joinPath = joinInviteAbsoluteUrl(inviteCode, opts.to);

  const text = [
    `Hi ${name},`,
    "",
    `${orgName} invited you to join Inspect AI as a ${roleWord}.`,
    "",
    "What to do",
    "1. Open this address in your browser (copy the full line):",
    "",
    joinPath,
    "",
    "2. Sign in or create an account. Use the same email this message was sent to.",
    "",
    "If the site asks for a code instead, use:",
    inviteCode,
    "",
    "This invite is only for the email address above. If that is not you, delete this message.",
    "",
    "—",
    `${orgName} (via Inspect AI)`,
  ].join("\n");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: `[Inspect AI] Invitation from ${orgName}`,
    text,
    html: plainTextToEmailHtml(text),
  });

  if (error) {
    console.error("[email] membership invite send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

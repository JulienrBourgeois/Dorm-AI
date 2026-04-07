import { getResendFrom } from "@/lib/email/config";
import { joinInviteAbsoluteUrl } from "@/lib/joinInviteLink";
import { escapeHtml, htmlAttrHref } from "@/lib/email/escapeHtml";
import { getResend } from "@/lib/email/resendClient";

type InviteRole = "TENANT" | "INSPECTOR";

function oneLine(s: string, max = 200): string {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

function roleLabel(role: InviteRole): string {
  return role === "INSPECTOR" ? "an inspector" : "a resident";
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
  const rolePhrase = roleLabel(opts.role);
  const inviteCode = oneLine(opts.inviteCode.toUpperCase(), 40);
  const joinPath = joinInviteAbsoluteUrl(inviteCode, opts.to);

  const text = [
    `Hi ${name},`,
    "",
    `${orgName} invited you to join as ${rolePhrase}.`,
    "",
    "Use the link below. You may be asked to sign in or create an account first.",
    "",
    joinPath,
    "",
    `Invite code (if the site asks for it): ${inviteCode}`,
    "",
    `— ${orgName} · Inspect AI`,
  ].join("\n");

  const html = [
    `<p>Hi ${escapeHtml(name)},</p>`,
    `<p><strong>${escapeHtml(orgName)}</strong> invited you to join as ${escapeHtml(rolePhrase)}.</p>`,
    `<p><a href="${htmlAttrHref(joinPath)}">Continue with this invitation</a></p>`,
    `<p style="font-size:13px;color:#555">You may need to sign in first. If the link doesn’t work, copy this address into your browser:<br>${escapeHtml(joinPath)}</p>`,
    `<p style="font-size:13px;color:#555">— ${escapeHtml(orgName)} · Inspect AI</p>`,
  ].join("");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: `Invitation from ${orgName}`,
    text,
    html,
  });

  if (error) {
    console.error("[email] membership invite send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

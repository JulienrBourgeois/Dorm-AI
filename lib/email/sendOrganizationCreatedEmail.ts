import { getAppHostname, getAppOrigin, getResendFrom } from "@/lib/email/config";
import { escapeHtml, htmlAttrHref } from "@/lib/email/escapeHtml";
import { getResend } from "@/lib/email/resendClient";

function oneLine(s: string, max = 200): string {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

export async function sendOrganizationCreatedEmail(opts: {
  to: string;
  displayName?: string | null;
  organizationName: string;
  organizationId: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing; skip organization email");
    return { ok: false, reason: "not_configured" };
  }

  const rawFirst =
    opts.displayName?.trim().split(/\s+/)[0] ||
    opts.to.split("@")[0] ||
    "there";
  const first = oneLine(rawFirst, 80);
  const orgName = oneLine(opts.organizationName, 200);
  const origin = getAppOrigin();
  const host = getAppHostname();
  const workspaceUrl = `${origin}/admin/dashboard?organizationId=${encodeURIComponent(opts.organizationId)}`;

  const text = [
    `Hi ${first},`,
    "",
    `Your workspace “${orgName}” is ready. When you sign in, you can add buildings, rooms, and people, and schedule inspections from there.`,
    "",
    "Open it here:",
    workspaceUrl,
    "",
    `You can always reach the app at ${host}.`,
    "",
    "— Inspect AI",
  ].join("\n");

  const html = [
    `<p>Hi ${escapeHtml(first)},</p>`,
    `<p>Your workspace <strong>${escapeHtml(orgName)}</strong> is ready. After you sign in, you can add buildings and rooms, invite people, and schedule inspections.</p>`,
    `<p><a href="${htmlAttrHref(workspaceUrl)}">Open your workspace</a></p>`,
    `<p style="font-size:13px;color:#555">If the link doesn’t open, copy this into your browser:<br>${escapeHtml(workspaceUrl)}</p>`,
    `<p style="font-size:13px;color:#555">You can also go to ${escapeHtml(host)} and choose this organization from the menu.</p>`,
    '<p style="font-size:13px;color:#555">— Inspect AI</p>',
  ].join("");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: `${orgName} is ready`,
    text,
    html,
  });

  if (error) {
    console.error("[email] organization send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

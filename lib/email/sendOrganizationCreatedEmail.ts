import { getAppOrigin, getResendFrom } from "@/lib/email/config";
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
  const dashboardUrl = `${origin}/admin/dashboard?organizationId=${encodeURIComponent(opts.organizationId)}`;

  const text = [
    `${orgName} is set up in Inspect AI.`,
    "",
    `Hi ${first},`,
    "",
    `You created "${orgName}" in Inspect AI. This workspace holds buildings, rooms, tenants, inspectors, and inspections.`,
    "",
    "You can:",
    "- Add buildings and rooms.",
    "- Invite inspectors and residents when you are ready.",
    "- Schedule inspections from the dashboard.",
    "",
    `Open your dashboard: ${dashboardUrl}`,
    "",
    "Bookmark that link to return to this organization.",
  ].join("\n");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: `${orgName} is live on Inspect AI`,
    text,
  });

  if (error) {
    console.error("[email] organization send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

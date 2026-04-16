import { getAppHostname, getAppOrigin, getResendFrom } from "@/lib/email/config";
import { plainTextToEmailHtml } from "@/lib/email/plainEmailHtml";
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
  const host = getAppHostname();
  const origin = getAppOrigin();
  const workspaceUrl = `${origin}/admin/dashboard?organizationId=${encodeURIComponent(opts.organizationId)}`;

  const text = [
    `Hi ${first},`,
    "",
    "Your organization workspace on Inspect AI is ready.",
    "",
    `Organization: ${orgName}`,
    "",
    "Open your admin dashboard by copying this address into your browser:",
    "",
    workspaceUrl,
    "",
    `Or sign in at ${host}, then choose this organization from the menu.`,
    "",
    "—",
    "Inspect AI",
  ].join("\n");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: `[Inspect AI] ${orgName} — workspace ready`,
    text,
    html: plainTextToEmailHtml(text),
  });

  if (error) {
    console.error("[email] organization send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

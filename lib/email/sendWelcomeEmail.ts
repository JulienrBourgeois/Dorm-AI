import { getAppHostname, getAppOrigin, getResendFrom } from "@/lib/email/config";
import { escapeHtml, htmlAttrHref } from "@/lib/email/escapeHtml";
import { getResend } from "@/lib/email/resendClient";

function oneLine(s: string, max = 200): string {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

export async function sendWelcomeEmail(opts: {
  to: string;
  displayName?: string | null;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing; skip welcome email");
    return { ok: false, reason: "not_configured" };
  }

  const rawFirst =
    opts.displayName?.trim().split(/\s+/)[0] ||
    opts.to.split("@")[0] ||
    "there";
  const first = oneLine(rawFirst, 80);
  const origin = getAppOrigin();
  const host = getAppHostname();

  const text = [
    `Hi ${first},`,
    "",
    "Thanks for creating an account. You can sign in any time at the link below.",
    "",
    origin,
    "",
    `If you prefer, open ${host} in your browser and sign in from there.`,
    "",
    "— Inspect AI",
  ].join("\n");

  const html = [
    `<p>Hi ${escapeHtml(first)},</p>`,
    "<p>Thanks for creating an account. You can sign in whenever you’re ready.</p>",
    `<p><a href="${htmlAttrHref(origin)}">Sign in to Inspect AI</a></p>`,
    `<p style="font-size:13px;color:#555">If the link above doesn’t open, copy this into your browser: ${escapeHtml(origin)}</p>`,
    '<p style="font-size:13px;color:#555">— Inspect AI</p>',
  ].join("");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: "Your Inspect AI account",
    text,
    html,
  });

  if (error) {
    console.error("[email] welcome send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

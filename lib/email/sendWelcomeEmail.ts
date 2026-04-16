import { getAppHostname, getAppOrigin, getResendFrom } from "@/lib/email/config";
import { plainTextToEmailHtml } from "@/lib/email/plainEmailHtml";
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
    "Thanks for creating an account on Inspect AI.",
    "",
    "Sign in by opening this address in your browser (copy the whole line):",
    "",
    origin,
    "",
    `Or go to ${host}, sign in, and continue from the home page.`,
    "",
    "If you did not create this account, you can ignore this message.",
    "",
    "—",
    "Inspect AI",
  ].join("\n");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: "[Inspect AI] Your new account",
    text,
    html: plainTextToEmailHtml(text),
  });

  if (error) {
    console.error("[email] welcome send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

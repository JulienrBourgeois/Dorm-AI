import { getAppOrigin, getResendFrom } from "@/lib/email/config";
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

  const text = [
    `Hi ${first},`,
    "",
    "Your Inspect AI account is ready. You can schedule inspections, document units, and keep everything scoped to your property.",
    "",
    "Next steps:",
    "- Finish your profile when prompted.",
    "- Create an organization or join one with an invite.",
    "- Use the admin console when you are ready to manage buildings, rooms, and inspections.",
    "",
    `Open the app: ${origin}`,
    "",
    "Questions? Reply to this email.",
  ].join("\n");

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to: opts.to,
    subject: "Welcome to Inspect AI",
    text,
  });

  if (error) {
    console.error("[email] welcome send failed", error);
    return { ok: false, reason: String(error.message ?? error) };
  }
  return { ok: true };
}

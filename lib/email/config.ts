/**
 * Resend + app URL for transactional email.
 * Set RESEND_API_KEY in .env.local. Optional: RESEND_FROM_EMAIL (default uses Resend test sender).
 */
export function getResendApiKey(): string | undefined {
  const k = process.env.RESEND_API_KEY?.trim();
  return k || undefined;
}

/** Display name + address. Use a verified domain in production. */
export function getResendFrom(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (raw) return raw.includes("<") ? raw : `Inspect AI <${raw}>`;
  return "Inspect AI <onboarding@resend.dev>";
}

export function isResendConfigured(): boolean {
  return Boolean(getResendApiKey());
}

export function getAppOrigin(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (base) return base;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}

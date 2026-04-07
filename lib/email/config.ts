/**
 * Resend + app URL for transactional email.
 *
 * - RESEND_API_KEY — required (Resend dashboard).
 * - RESEND_FROM_EMAIL — optional. If unset, uses the verified product domain so mail can reach any recipient
 *   (onboarding@resend.dev only delivers to your own address).
 */
const DEFAULT_RESEND_FROM = "Inspect AI <noreply@inspectai.info>";

export function getResendApiKey(): string | undefined {
  const k = process.env.RESEND_API_KEY?.trim();
  return k || undefined;
}

/** Display name + address; must be on a domain verified in Resend. */
export function getResendFrom(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (raw) return raw.includes("<") ? raw : `Inspect AI <${raw}>`;
  return DEFAULT_RESEND_FROM;
}

export function isResendConfigured(): boolean {
  return Boolean(getResendApiKey());
}

export function getAppOrigin(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (base) return base;
  const appUrl = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) return appUrl;
  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(
    /^https?:\/\//,
    "",
  );
  if (prodUrl) return `https://${prodUrl.replace(/\/$/, "")}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  if (process.env.NODE_ENV === "production") return "https://www.inspectai.info";
  return "http://localhost:3000";
}

/** Hostname for plain-language email copy (e.g. inspectai.info). */
export function getAppHostname(): string {
  try {
    return new URL(getAppOrigin()).host;
  } catch {
    return getAppOrigin().replace(/^https?:\/\//, "").split("/")[0] ?? "our site";
  }
}


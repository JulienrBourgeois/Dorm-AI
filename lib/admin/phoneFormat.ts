/**
 * US phone only: display (+1 (555) 123-4567) and E.164 for Firebase (+15551234567).
 * Input is expected to be digits only (up to 11: optional leading 1 + 10).
 */

const DIGITS_ONLY = /\D/g;

/** Format digits as US display: +1 (555) 123-4567. */
export function formatPhoneDisplay(digitsOrFormatted: string): string {
  const digits = digitsOrFormatted.replace(DIGITS_ONLY, "").slice(0, 11);
  if (digits.length === 0) return "";
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits.slice(0, 10);
  const a = ten.slice(0, 3);
  const b = ten.slice(3, 6);
  const c = ten.slice(6, 10);
  if (ten.length <= 3) return `+1 (${a}`;
  if (ten.length <= 6) return `+1 (${a}) ${b}`;
  return `+1 (${a}) ${b}-${c}`;
}

/** Digits (10 or 11 with leading 1) to E.164 for Firebase. */
export function phoneToE164(digitsOrFormatted: string): string {
  const digits = digitsOrFormatted.replace(DIGITS_ONLY, "");
  if (digits.length >= 10) {
    const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits.slice(0, 10);
    return `+1${ten}`;
  }
  return `+1${digits}`;
}

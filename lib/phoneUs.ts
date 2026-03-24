/** US phone: display as (XXX) XXX-XXXX; store as E.164 +1XXXXXXXXXX. */

export function usPhoneDigitsFromInput(formatted: string): string {
  let d = formatted.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.slice(0, 10);
}

export function formatUsPhoneInput(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function usDigitsToE164(digits10: string): string | null {
  if (digits10.length !== 10) return null;
  return `+1${digits10}`;
}

export function e164ToUsPhoneInput(e164: string): string {
  const d = e164.replace(/\D/g, "");
  const ten =
    d.length === 11 && d.startsWith("1")
      ? d.slice(1)
      : d.length >= 10
        ? d.slice(-10)
        : d;
  return formatUsPhoneInput(ten);
}

/** Basic NANP checks (area / exchange cannot start with 0 or 1). */
export function isValidNanp10(digits: string): boolean {
  if (digits.length !== 10) return false;
  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  if (area[0] === "0" || area[0] === "1") return false;
  if (exchange[0] === "0" || exchange[0] === "1") return false;
  return true;
}

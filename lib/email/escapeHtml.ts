/** Escape text and URLs used inside HTML body (not for raw href values — use htmlAttrHref). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Safe double-quoted attribute value for href (encodes & and "). */
export function htmlAttrHref(url: string): string {
  return url.replace(/&/g, "&amp;").replace(/"/g, "%22");
}

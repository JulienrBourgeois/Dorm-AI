import { escapeHtml } from "@/lib/email/escapeHtml";

/**
 * HTML part that mirrors the plain-text body exactly: no hyperlinks, no tracking pixels.
 * Keeps multipart emails consistent and avoids “click here” / hidden-URL patterns that often hurt deliverability.
 */
export function plainTextToEmailHtml(body: string): string {
  return [
    '<div style="font-family:system-ui,Segoe UI,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;">',
    `<pre style="margin:0;font-family:inherit;white-space:pre-wrap;word-break:break-word;">${escapeHtml(body)}</pre>`,
    "</div>",
  ].join("");
}

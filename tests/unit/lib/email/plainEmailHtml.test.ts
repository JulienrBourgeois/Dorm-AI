import { describe, expect, it } from "vitest";
import { plainTextToEmailHtml } from "@/lib/email/plainEmailHtml";

describe("plainTextToEmailHtml", () => {
  it("escapes HTML and does not inject anchor tags", () => {
    const body = "Hi,\n\nOpen:\nhttps://example.com?x=1&y=2\n\n<script>";
    const html = plainTextToEmailHtml(body);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("https://example.com?x=1&amp;y=2");
    expect(html).not.toContain("<a ");
  });
});

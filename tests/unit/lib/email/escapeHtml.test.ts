import { describe, expect, it } from "vitest";
import { escapeHtml, htmlAttrHref } from "@/lib/email/escapeHtml";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<&>"`)).toBe("&lt;&amp;&gt;&quot;");
  });
});

describe("htmlAttrHref", () => {
  it("escapes ampersand and double quote for attributes", () => {
    expect(htmlAttrHref(`https://x.com?a=1&b="`)).toContain("&amp;");
    expect(htmlAttrHref(`say"hi`)).toContain("%22");
  });
});

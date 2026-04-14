import { describe, expect, it } from "vitest";
import {
  cursorAfterDigits,
  formatPhoneDisplay,
  phoneToE164,
} from "@/lib/auth/phoneFormat";

describe("formatPhoneDisplay", () => {
  it("formats progressively", () => {
    expect(formatPhoneDisplay("555")).toBe("+1 (555");
    expect(formatPhoneDisplay("5551234567")).toBe("+1 (555) 123-4567");
  });
});

describe("phoneToE164", () => {
  it("produces +1 plus 10 digits", () => {
    expect(phoneToE164("5551234567")).toBe("+15551234567");
    expect(phoneToE164("15551234567")).toBe("+15551234567");
  });
});

describe("cursorAfterDigits", () => {
  it("returns position after nth digit", () => {
    const s = "+1 (555) 12";
    expect(cursorAfterDigits(s, 5)).toBeGreaterThan(0);
    expect(cursorAfterDigits(s, 100)).toBe(s.length);
  });
});

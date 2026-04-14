import { describe, expect, it } from "vitest";
import {
  e164ToUsPhoneInput,
  formatUsPhoneInput,
  isValidNanp10,
  usDigitsToE164,
  usPhoneDigitsFromInput,
} from "@/lib/phoneUs";

describe("usPhoneDigitsFromInput", () => {
  it("strips non-digits and takes 10 digits", () => {
    expect(usPhoneDigitsFromInput("(555) 123-4567")).toBe("5551234567");
  });

  it("drops leading country 1", () => {
    expect(usPhoneDigitsFromInput("1-555-123-4567")).toBe("5551234567");
  });
});

describe("formatUsPhoneInput", () => {
  it("formats partial input", () => {
    expect(formatUsPhoneInput("555")).toBe("(555");
    expect(formatUsPhoneInput("5551234")).toBe("(555) 123-4");
    expect(formatUsPhoneInput("5551234567")).toBe("(555) 123-4567");
  });
});

describe("usDigitsToE164", () => {
  it("returns E.164 for 10 digits", () => {
    expect(usDigitsToE164("5551234567")).toBe("+15551234567");
  });

  it("returns null for wrong length", () => {
    expect(usDigitsToE164("123")).toBeNull();
  });
});

describe("e164ToUsPhoneInput", () => {
  it("round-trips from +1", () => {
    expect(e164ToUsPhoneInput("+15551234567")).toBe("(555) 123-4567");
  });
});

describe("isValidNanp10", () => {
  it("rejects invalid area/exchange start digits", () => {
    expect(isValidNanp10("0551234567")).toBe(false);
    expect(isValidNanp10("5550534567")).toBe(false);
  });

  it("accepts valid NANP (exchange cannot start with 0 or 1)", () => {
    expect(isValidNanp10("2122345678")).toBe(true);
  });
});

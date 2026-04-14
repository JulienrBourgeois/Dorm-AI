import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "@/lib/auth/authErrors";

describe("getAuthErrorMessage", () => {
  it("maps known Firebase codes", () => {
    expect(getAuthErrorMessage({ code: "auth/invalid-email" })).toContain(
      "valid email",
    );
    expect(getAuthErrorMessage({ code: "auth/wrong-password" })).toContain(
      "Invalid",
    );
  });

  it("falls back to Error message", () => {
    expect(getAuthErrorMessage(new Error("custom"))).toBe("custom");
  });

  it("falls back for unknown", () => {
    expect(getAuthErrorMessage({ code: "auth/unknown-code" })).toContain(
      "Something went wrong",
    );
  });
});

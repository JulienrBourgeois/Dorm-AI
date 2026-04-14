import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/core/errors";
import { requireEnum, requireString } from "@/lib/core/validation";

describe("requireString", () => {
  it("returns trimmed string when valid", () => {
    expect(requireString("  hello  ", "x")).toBe("hello");
  });

  it("throws VALIDATION_ERROR when not a string", () => {
    expect(() => requireString(1, "field")).toThrow(AppError);
    try {
      requireString(null, "field");
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe("VALIDATION_ERROR");
      expect((e as AppError).status).toBe(400);
    }
  });

  it("enforces minLength", () => {
    expect(() => requireString("", "f", { minLength: 1 })).toThrow(AppError);
  });

  it("enforces maxLength", () => {
    expect(() => requireString("abcd", "f", { maxLength: 3 })).toThrow(AppError);
  });

  it("respects trim: false", () => {
    expect(requireString("  x  ", "f", { trim: false })).toBe("  x  ");
  });
});

describe("requireEnum", () => {
  it("returns value when in allowed set", () => {
    expect(requireEnum("a", ["a", "b"] as const, "f")).toBe("a");
  });

  it("throws when value not allowed", () => {
    expect(() => requireEnum("c", ["a", "b"] as const, "f")).toThrow(AppError);
  });
});

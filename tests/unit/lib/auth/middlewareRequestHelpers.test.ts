import { describe, expect, it } from "vitest";
import {
  extractRedirectTarget,
  hasSessionCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/middlewareRequestHelpers";

describe("SESSION_COOKIE_NAME", () => {
  it("matches cookie prefix used by middleware", () => {
    expect(SESSION_COOKIE_NAME).toBe("__session");
  });
});

describe("hasSessionCookie", () => {
  it("is false for null or empty", () => {
    expect(hasSessionCookie(null)).toBe(false);
    expect(hasSessionCookie("")).toBe(false);
  });

  it("detects session cookie substring", () => {
    expect(hasSessionCookie(`foo=1; ${SESSION_COOKIE_NAME}=abc; path=/`)).toBe(
      true,
    );
  });
});

describe("extractRedirectTarget", () => {
  it("reads nested data.redirect", () => {
    expect(
      extractRedirectTarget({ ok: true, data: { redirect: "/home/dashboard" } }),
    ).toBe("/home/dashboard");
  });

  it("reads top-level redirect", () => {
    expect(extractRedirectTarget({ redirect: "/tenant" })).toBe("/tenant");
  });

  it("returns null for invalid shapes", () => {
    expect(extractRedirectTarget(null)).toBeNull();
    expect(extractRedirectTarget({ data: {} })).toBeNull();
    expect(extractRedirectTarget({ redirect: 123 })).toBeNull();
  });
});

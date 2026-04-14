import { describe, expect, it } from "vitest";
import { AppError, isAppError, toAppError } from "@/lib/core/errors";

describe("AppError", () => {
  it("sets code, status, message", () => {
    const e = new AppError("X", "msg", 418, { a: 1 });
    expect(e.code).toBe("X");
    expect(e.message).toBe("msg");
    expect(e.status).toBe(418);
    expect(e.details).toEqual({ a: 1 });
    expect(e.name).toBe("AppError");
  });
});

describe("isAppError", () => {
  it("returns true for AppError", () => {
    expect(isAppError(new AppError("X", "m"))).toBe(true);
  });

  it("returns false for plain Error", () => {
    expect(isAppError(new Error("x"))).toBe(false);
  });
});

describe("toAppError", () => {
  it("returns same instance for AppError", () => {
    const e = new AppError("C", "m", 400);
    expect(toAppError(e)).toBe(e);
  });

  it("wraps generic Error", () => {
    const e = toAppError(new Error("oops"));
    expect(e.code).toBe("INTERNAL_ERROR");
    expect(e.message).toBe("oops");
    expect(e.status).toBe(500);
  });

  it("wraps unknown", () => {
    const e = toAppError(123);
    expect(e.message).toBe("Unexpected error");
  });
});

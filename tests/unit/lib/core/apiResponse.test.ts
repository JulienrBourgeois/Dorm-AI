import { describe, expect, it } from "vitest";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";

describe("apiOk", () => {
  it("returns JSON body with ok true and data", async () => {
    const res = apiOk({ foo: 1 });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; data: { foo: number } };
    expect(json.ok).toBe(true);
    expect(json.data).toEqual({ foo: 1 });
  });
});

describe("apiError", () => {
  it("maps AppError to body and status", async () => {
    const res = apiError(new AppError("BAD", "nope", 422));
    expect(res.status).toBe(422);
    const json = (await res.json()) as {
      ok: boolean;
      error: { code: string; message: string };
    };
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("BAD");
    expect(json.error.message).toBe("nope");
  });

  it("uses fallback for unknown errors", async () => {
    const res = apiError(new Error("x"), "fallback");
    const json = (await res.json()) as { error: { message: string } };
    expect(json.error.message).toBe("x");
  });
});

import { NextResponse } from "next/server";
import { toAppError } from "@/lib/core/errors";
import type { ApiErrorBody, ApiSuccess } from "@/types";

export function apiOk<T>(data: T, init?: ResponseInit) {
  const body: ApiSuccess<T> = {
    ok: true,
    data,
  };
  return NextResponse.json(body, init);
}

export function apiError(error: unknown, fallbackMessage = "Request failed") {
  const normalized = toAppError(error);
  const body: ApiErrorBody = {
    ok: false,
    error: {
      code: normalized.code,
      message: normalized.message || fallbackMessage,
      ...(normalized.details ? { details: normalized.details } : {}),
    },
  };
  return NextResponse.json(body, { status: normalized.status });
}

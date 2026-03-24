import { AppError } from "@/lib/core/errors";

export function requireString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number; trim?: boolean },
): string {
  const trim = options?.trim ?? true;
  if (typeof value !== "string") {
    throw new AppError("VALIDATION_ERROR", `${fieldName} must be a string`, 400);
  }
  const normalized = trim ? value.trim() : value;
  const minLength = options?.minLength ?? 1;
  const maxLength = options?.maxLength;
  if (normalized.length < minLength) {
    throw new AppError(
      "VALIDATION_ERROR",
      `${fieldName} must be at least ${minLength} character(s)`,
      400,
    );
  }
  if (typeof maxLength === "number" && normalized.length > maxLength) {
    throw new AppError(
      "VALIDATION_ERROR",
      `${fieldName} must be at most ${maxLength} character(s)`,
      400,
    );
  }
  return normalized;
}

export function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string,
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new AppError(
      "VALIDATION_ERROR",
      `${fieldName} must be one of: ${allowed.join(", ")}`,
      400,
    );
  }
  return value as T;
}

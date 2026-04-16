/**
 * Check if a Firebase Auth user exists for the given email (via `/api/auth/check-email`).
 * Invite placeholders in Firestore do not count as existing accounts.
 */
export async function isUserExistsByEmail(email: string): Promise<boolean> {
  const trimmed = email.trim();
  if (!trimmed) return false;
  const res = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: trimmed }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      "error" in (data as object) &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : (data as { error?: { message?: string } }).error?.message;
    throw new Error(
      message ?? "Failed to check email"
    );
  }
  const raw = (await res.json()) as Record<string, unknown>;
  const nested = raw.data;
  if (nested && typeof nested === "object" && "exists" in nested) {
    return Boolean((nested as { exists?: boolean }).exists);
  }
  if ("exists" in raw) return Boolean(raw.exists);
  return false;
}

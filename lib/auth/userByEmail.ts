/**
 * Check if a user document exists in the users collection with the given email.
 * Calls a server API route (admin Firestore) so unauthenticated users can use forgot-password.
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

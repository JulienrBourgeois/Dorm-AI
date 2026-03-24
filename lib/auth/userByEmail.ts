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
  const data = (await res.json()) as
    | { exists: boolean }
    | { data?: { exists?: boolean } };
  if ("data" in data) return Boolean(data.data?.exists);
  return Boolean(data.exists);
}

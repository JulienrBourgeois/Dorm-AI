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
    throw new Error(
      (data as { error?: string }).error ?? "Failed to check email"
    );
  }
  const data = (await res.json()) as { exists: boolean };
  return data.exists;
}

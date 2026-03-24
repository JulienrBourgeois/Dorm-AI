import type { User } from "firebase/auth";

/** Fire-and-forget transactional email (server sends via Resend). */
export async function triggerWelcomeEmail(user: User): Promise<void> {
  const token = await user.getIdToken();
  await fetch("/api/email/welcome", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "same-origin",
  });
}

export async function triggerOrganizationCreatedEmail(
  user: User,
  organizationId: string,
): Promise<void> {
  const token = await user.getIdToken();
  await fetch("/api/email/organization-created", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ organizationId }),
  });
}

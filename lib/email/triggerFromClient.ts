import type { User } from "firebase/auth";

async function assertEmailResponse(
  response: Response,
  fallbackMessage: string,
): Promise<void> {
  let payload: unknown = null;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      payload.error &&
      typeof payload.error === "object" &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
        ? payload.error.message
        : fallbackMessage;
    throw new Error(message);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data &&
    typeof payload.data === "object" &&
    "sent" in payload.data &&
    payload.data.sent === false
  ) {
    const skipped =
      "skipped" in payload.data && typeof payload.data.skipped === "string"
        ? payload.data.skipped
        : "unknown";
    throw new Error(`Email was skipped (${skipped}).`);
  }
}

/** Fire-and-forget transactional email (server sends via Resend). */
export async function triggerWelcomeEmail(user: User): Promise<void> {
  const token = await user.getIdToken();
  const response = await fetch("/api/email/welcome", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "same-origin",
  });
  await assertEmailResponse(response, "Welcome email failed.");
}

export async function triggerOrganizationCreatedEmail(
  user: User,
  organizationId: string,
): Promise<void> {
  const token = await user.getIdToken();
  const response = await fetch("/api/email/organization-created", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ organizationId }),
  });
  await assertEmailResponse(response, "Organization email failed.");
}

export async function triggerMembershipInviteEmail(
  user: User,
  payload: {
    organizationId: string;
    role: "TENANT" | "INSPECTOR";
    inviteCode: string;
    inviteeEmail: string;
    inviteeName?: string;
  },
): Promise<void> {
  const token = await user.getIdToken();
  const response = await fetch("/api/email/membership-invite", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  await assertEmailResponse(response, "Invite email failed.");
}

import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";
import { userIsActiveAdminForOrganization } from "@/lib/auth/adminOrgMembershipServer";
import { verifyFirebaseBearer } from "@/lib/auth/verifyFirebaseBearer";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError, isAppError } from "@/lib/core/errors";
import { requireEnum, requireString } from "@/lib/core/validation";
import { sendMembershipInviteEmail } from "@/lib/email/sendMembershipInviteEmail";
import type { Organization } from "@/types";

type InviteRole = "TENANT" | "INSPECTOR";

type Body = {
  organizationId?: string;
  role?: InviteRole;
  inviteCode?: string;
  inviteeEmail?: string;
  inviteeName?: string;
};

type InviteCodeDoc = {
  organizationId?: string;
  role?: InviteRole;
  inviteeEmail?: string;
};

export async function POST(request: Request) {
  const user = await verifyFirebaseBearer(request);
  if (!user) {
    return apiError(new AppError("UNAUTHORIZED", "Invalid or missing token", 401));
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return apiError(new AppError("BAD_REQUEST", "Invalid JSON", 400));
  }

  let organizationId: string;
  let role: InviteRole;
  let inviteCode: string;
  let inviteeEmail: string;
  let inviteeName: string | undefined;
  try {
    organizationId = requireString(body.organizationId, "organizationId", { minLength: 1 });
    role = requireEnum(body.role, ["TENANT", "INSPECTOR"], "role");
    inviteCode = requireString(body.inviteCode, "inviteCode", {
      minLength: 4,
      maxLength: 32,
    }).toUpperCase();
    inviteeEmail = requireString(body.inviteeEmail, "inviteeEmail", {
      minLength: 3,
      maxLength: 320,
    }).toLowerCase();
    inviteeName = body.inviteeName ? requireString(body.inviteeName, "inviteeName") : undefined;
  } catch (err) {
    if (isAppError(err)) return apiError(err);
    throw err;
  }

  const allowed = await userIsActiveAdminForOrganization(user.uid, organizationId);
  if (!allowed) {
    return apiError(new AppError("FORBIDDEN", "Not an admin for this organization", 403));
  }

  const db = getAdminFirestore();
  const inviteSnap = await db.collection(COLLECTIONS.inviteCodes).doc(inviteCode).get();
  const invite = inviteSnap.data() as InviteCodeDoc | undefined;
  if (!inviteSnap.exists || !invite) {
    return apiError(new AppError("NOT_FOUND", "Invite code not found", 404));
  }
  if (invite.organizationId !== organizationId || invite.role !== role) {
    return apiError(new AppError("FORBIDDEN", "Invite code mismatch", 403));
  }
  const storedInvitee = typeof invite.inviteeEmail === "string" ? invite.inviteeEmail.toLowerCase() : null;
  if (storedInvitee && storedInvitee !== inviteeEmail) {
    return apiError(new AppError("FORBIDDEN", "Invite email mismatch", 403));
  }

  const orgSnap = await db.collection(COLLECTIONS.organizations).doc(organizationId).get();
  const orgData = orgSnap.data() as Organization | undefined;
  const organizationName = orgData?.name?.trim() || "your organization";

  const result = await sendMembershipInviteEmail({
    to: inviteeEmail,
    inviteeName,
    organizationName,
    role,
    inviteCode,
  });

  if (!result.ok && result.reason === "not_configured") {
    return apiOk({ sent: false, skipped: "resend_not_configured" as const });
  }
  if (!result.ok) {
    return apiError(new AppError("EMAIL_FAILED", result.reason, 502));
  }

  return apiOk({ sent: true as const });
}

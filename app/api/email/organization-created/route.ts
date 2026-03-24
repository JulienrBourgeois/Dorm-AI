import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";
import { userIsActiveAdminForOrganization } from "@/lib/auth/adminOrgMembershipServer";
import { sendOrganizationCreatedEmail } from "@/lib/email/sendOrganizationCreatedEmail";
import { verifyFirebaseBearer } from "@/lib/auth/verifyFirebaseBearer";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError, isAppError } from "@/lib/core/errors";
import { requireString } from "@/lib/core/validation";
import type { Organization } from "@/types";

type Body = { organizationId?: string };

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
  try {
    organizationId = requireString(body.organizationId, "organizationId", {
      minLength: 1,
    });
  } catch (err) {
    if (isAppError(err)) return apiError(err);
    throw err;
  }

  const allowed = await userIsActiveAdminForOrganization(user.uid, organizationId);
  if (!allowed) {
    return apiError(new AppError("FORBIDDEN", "Not an admin for this organization", 403));
  }

  const db = getAdminFirestore();
  const orgRef = db.collection(COLLECTIONS.organizations).doc(organizationId);

  const snap = await orgRef.get();
  const data = snap.data() as Organization | undefined;
  const organizationName = data?.name?.trim() || "Your organization";

  const claimed = await db.runTransaction(async (tx) => {
    const fresh = await tx.get(orgRef);
    const d = fresh.data() as { organizationCreatedEmailSentAt?: unknown } | undefined;
    if (d?.organizationCreatedEmailSentAt != null) return false;
    tx.set(
      orgRef,
      { organizationCreatedEmailSentAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    return true;
  });

  if (!claimed) {
    return apiOk({ sent: false, skipped: "already_sent" as const });
  }

  const clearClaim = () =>
    orgRef.set(
      { organizationCreatedEmailSentAt: FieldValue.delete() },
      { merge: true },
    );

  const result = await sendOrganizationCreatedEmail({
    to: user.email,
    displayName: user.name,
    organizationName,
    organizationId,
  });

  if (!result.ok && result.reason === "not_configured") {
    await clearClaim();
    return apiOk({ sent: false, skipped: "resend_not_configured" as const });
  }
  if (!result.ok) {
    await clearClaim();
    return apiError(new AppError("EMAIL_FAILED", result.reason, 502));
  }
  return apiOk({ sent: true as const });
}

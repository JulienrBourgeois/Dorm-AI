import { getAdminAuth, getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore";
import { requireSessionCookie } from "@/lib/auth/session";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";
import { requireString } from "@/lib/core/validation";

type Body = {
  code?: string;
};

type InviteCodeDoc = {
  organizationId: string;
  role: "INSPECTOR" | "TENANT";
  createdAt?: unknown;
  expiresAt?: unknown;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function isInviteExpired(doc: InviteCodeDoc): boolean {
  const now = Date.now();
  const expiresAt = toDate(doc.expiresAt);
  if (expiresAt) return expiresAt.getTime() < now;
  const createdAt = toDate(doc.createdAt);
  if (!createdAt) return false;
  const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
  return createdAt.getTime() + THIRTY_DAYS_MS < now;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const code = requireString(body.code, "code", {
      minLength: 4,
      maxLength: 32,
    }).toUpperCase();

    const sessionCookie = requireSessionCookie(request);
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    const db = getAdminFirestore();
    const inviteRef = db.collection(COLLECTIONS.inviteCodes).doc(code);
    const inviteSnap = await inviteRef.get();
    if (!inviteSnap.exists) {
      throw new AppError("NOT_FOUND", "Invalid invite code.", 404);
    }
    const invite = inviteSnap.data() as InviteCodeDoc;
    if (!invite?.organizationId || !invite?.role) {
      throw new AppError("INVALID_INVITE", "Invite code is malformed.", 400);
    }
    if (isInviteExpired(invite)) {
      throw new AppError("INVITE_EXPIRED", "Invite code has expired.", 410);
    }

    const membershipId = `${decoded.uid}-${invite.organizationId}`;
    const now = new Date();
    await db
      .collection(COLLECTIONS.memberships)
      .doc(membershipId)
      .set(
        {
          userId: decoded.uid,
          organizationId: invite.organizationId,
          role: invite.role,
          status: "ACTIVE",
          updatedAt: now,
          createdAt: now,
        },
        { merge: true },
      );

    await db.collection(COLLECTIONS.auditEvents).add({
      eventType: "membership.joined_by_invite",
      actorId: decoded.uid,
      entityType: "membership",
      entityId: membershipId,
      membershipId,
      organizationId: invite.organizationId,
      source: "api.auth.join-invite",
      metadata: { inviteCode: code, role: invite.role },
      createdAt: now,
    });

    return apiOk({
      membershipId,
      role: invite.role,
      organizationId: invite.organizationId,
    });
  } catch (err) {
    console.error("[auth/join-invite]", err);
    return apiError(err, "Failed to process invite code.");
  }
}

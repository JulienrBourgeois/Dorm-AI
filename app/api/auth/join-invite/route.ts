import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore";
import { verifyFirebaseBearer } from "@/lib/auth/verifyFirebaseBearer";
import { apiError, apiOk } from "@/lib/core/apiResponse";
import { AppError } from "@/lib/core/errors";
import { requireString } from "@/lib/core/validation";

type Body = {
  code?: string;
};

type InviteCodeDoc = {
  organizationId: string;
  role: "INSPECTOR" | "TENANT";
  inviteeEmail?: string;
  roomId?: string | null;
  assignedBuildingIds?: string[];
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.trim().startsWith("Bearer ")) {
      throw new AppError(
        "UNAUTHORIZED",
        "Not signed in. Sign in first, then paste your invite code on the home page or open your invite link.",
        401,
      );
    }
    const actor = await verifyFirebaseBearer(request);
    if (!actor) {
      throw new AppError(
        "UNAUTHORIZED",
        "Could not verify your login. Try signing out and signing in again. Your account must include an email address on the sign-in provider.",
        401,
      );
    }

    const body = (await request.json()) as Body;
    const code = requireString(body.code, "code", {
      minLength: 4,
      maxLength: 32,
    }).toUpperCase();

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
    if (invite.inviteeEmail) {
      const invitee = invite.inviteeEmail.trim().toLowerCase();
      const actorEmail = (actor.email || "").trim().toLowerCase();
      if (!actorEmail || actorEmail !== invitee) {
        throw new AppError(
          "FORBIDDEN",
          "This invite is assigned to a different email address.",
          403,
        );
      }
    }

    const membershipId = `${actor.uid}-${invite.organizationId}`;
    const now = new Date();
    await db
      .collection(COLLECTIONS.memberships)
      .doc(membershipId)
      .set(
        {
          id: membershipId,
          userId: actor.uid,
          organizationId: invite.organizationId,
          role: invite.role,
          status: "ACTIVE",
          roomId: invite.role === "TENANT" ? (invite.roomId ?? null) : null,
          assignedBuildingIds:
            invite.role === "INSPECTOR"
              ? Array.isArray(invite.assignedBuildingIds)
                ? invite.assignedBuildingIds
                : []
              : [],
          updatedAt: now,
          createdAt: now,
        },
        { merge: true },
      );

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

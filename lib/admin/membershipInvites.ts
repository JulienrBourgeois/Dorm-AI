import type { User } from "firebase/auth";
import {
  COLLECTIONS,
  dateToTimestamp,
  deleteDocument,
  getDocumentData,
  queryCollection,
  setDocument,
} from "@/app/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { triggerMembershipInviteEmail } from "@/lib/email/triggerFromClient";
import type { MembershipStatus, User as AppUser } from "@/types";
import { isInvitePlaceholderUserId } from "@/lib/admin/membershipRecords";

export function makeInviteCode(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

function placeholderUserId(kind: "tenant" | "inspector") {
  const suffix = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return kind === "tenant" ? `invite_tenant_${suffix}` : `invite_inspector_${suffix}`;
}

type InviteMembershipDoc = {
  userId: string;
  organizationId: string;
  role: "TENANT" | "INSPECTOR";
  status: MembershipStatus;
  roomId?: string | null;
  assignedBuildingIds?: string[];
  pendingInviteCode?: string;
  createdAt?: unknown;
};

type ExistingInviteMatch = {
  membershipId: string;
  userId: string;
  email: string;
  status: MembershipStatus;
  pendingInviteCode?: string;
  roomId?: string | null;
  assignedBuildingIds?: string[];
};

async function findExistingInviteMatches(
  organizationId: string,
  role: "TENANT" | "INSPECTOR",
  email: string,
): Promise<ExistingInviteMatch[]> {
  const normalizedEmail = email.trim().toLowerCase();
  const membershipSnap = await queryCollection(
    COLLECTIONS.memberships,
    where("organizationId", "==", organizationId),
    where("role", "==", role),
  );

  const matches: ExistingInviteMatch[] = [];
  for (const doc of membershipSnap.docs) {
    const membership = doc.data() as InviteMembershipDoc;
    const { data: user } = await getDocumentData<AppUser>(COLLECTIONS.users, membership.userId);
    const userEmail = (user?.email ?? "").trim().toLowerCase();
    if (!userEmail || userEmail !== normalizedEmail) continue;

    matches.push({
      membershipId: doc.id,
      userId: membership.userId,
      email: userEmail,
      status: membership.status,
      pendingInviteCode: membership.pendingInviteCode,
      roomId: membership.roomId ?? null,
      assignedBuildingIds: membership.assignedBuildingIds ?? [],
    });
  }

  return matches;
}

function preferredExistingInviteMatch(matches: ExistingInviteMatch[]): ExistingInviteMatch | null {
  if (matches.length === 0) return null;
  return matches.slice(1).reduce((best, next) => {
    const bestScore =
      (best.status === "ACTIVE" ? 100 : 0) +
      (!isInvitePlaceholderUserId(best.userId) ? 10 : 0) +
      (best.status === "INVITED" ? 5 : 0) +
      (best.pendingInviteCode ? 1 : 0);
    const nextScore =
      (next.status === "ACTIVE" ? 100 : 0) +
      (!isInvitePlaceholderUserId(next.userId) ? 10 : 0) +
      (next.status === "INVITED" ? 5 : 0) +
      (next.pendingInviteCode ? 1 : 0);

    return nextScore > bestScore ? next : best;
  }, matches[0]);
}

async function cleanupDuplicateInviteMatches(
  matches: ExistingInviteMatch[],
  keeperMembershipId: string,
): Promise<void> {
  for (const match of matches) {
    if (match.membershipId === keeperMembershipId) continue;

    if (match.pendingInviteCode) {
      await deleteDocument(COLLECTIONS.inviteCodes, match.pendingInviteCode).catch(() => {});
    }

    await deleteDocument(COLLECTIONS.memberships, match.membershipId).catch(() => {});

    if (isInvitePlaceholderUserId(match.userId)) {
      await deleteDocument(COLLECTIONS.users, match.userId).catch(() => {});
    }
  }
}

export type CreateInviteResult = {
  inviteCode: string;
  emailSent: boolean;
};

async function sendInviteEmail(
  currentUser: User | null,
  payload: {
    organizationId: string;
    role: "TENANT" | "INSPECTOR";
    inviteCode: string;
    inviteeEmail: string;
    inviteeName: string;
  },
): Promise<boolean> {
  if (!currentUser) return false;
  try {
    await triggerMembershipInviteEmail(currentUser, payload);
    return true;
  } catch {
    return false;
  }
}

export async function createTenantInvite(params: {
  organizationId: string;
  name: string;
  email: string;
  roomId?: string | null;
  currentUser: User | null;
}): Promise<CreateInviteResult> {
  const { organizationId, name, email, roomId, currentUser } = params;
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedName || !trimmedEmail) {
    throw new Error("Name and email are required.");
  }

  const now = dateToTimestamp(new Date());
  const existingMatches = await findExistingInviteMatches(organizationId, "TENANT", trimmedEmail);
  const activeMatch = existingMatches.find((match) => match.status === "ACTIVE");
  if (activeMatch) {
    throw new Error("A tenant with this email is already active in this organization.");
  }

  const keeper = preferredExistingInviteMatch(existingMatches);
  const userId = keeper?.userId ?? placeholderUserId("tenant");
  const membershipId = keeper?.membershipId ?? `${userId}-${organizationId}`;
  const code = keeper?.pendingInviteCode ?? makeInviteCode("TEN");

  const { exists: userExists } = await getDocumentData<AppUser>(COLLECTIONS.users, userId);
  await setDocument(
    COLLECTIONS.users,
    userId,
    {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      role: "tenant",
      ...(userExists ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { merge: true },
  );

  const expiresAt = dateToTimestamp(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
  await setDocument(
    COLLECTIONS.memberships,
    membershipId,
    {
      id: membershipId,
      userId,
      organizationId,
      role: "TENANT",
      status: "INVITED",
      roomId: roomId || null,
      pendingInviteCode: code,
      ...(keeper ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { merge: true },
  );
  await setDocument(COLLECTIONS.inviteCodes, code, {
    organizationId,
    role: "TENANT",
    inviteeEmail: trimmedEmail,
    inviteeName: trimmedName,
    roomId: roomId || null,
    createdAt: now,
    expiresAt,
  });
  await cleanupDuplicateInviteMatches(existingMatches, membershipId);

  const emailSent = await sendInviteEmail(currentUser, {
    organizationId,
    role: "TENANT",
    inviteCode: code,
    inviteeEmail: trimmedEmail,
    inviteeName: trimmedName,
  });

  return { inviteCode: code, emailSent };
}

export async function createInspectorInvite(params: {
  organizationId: string;
  name: string;
  email: string;
  buildingId?: string | null;
  currentUser: User | null;
}): Promise<CreateInviteResult> {
  const { organizationId, name, email, buildingId, currentUser } = params;
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedName || !trimmedEmail) {
    throw new Error("Name and email are required.");
  }

  const now = dateToTimestamp(new Date());
  const existingMatches = await findExistingInviteMatches(organizationId, "INSPECTOR", trimmedEmail);
  const activeMatch = existingMatches.find((match) => match.status === "ACTIVE");
  if (activeMatch) {
    throw new Error("An inspector with this email is already active in this organization.");
  }

  const keeper = preferredExistingInviteMatch(existingMatches);
  const userId = keeper?.userId ?? placeholderUserId("inspector");
  const membershipId = keeper?.membershipId ?? `${userId}-${organizationId}`;
  const code = keeper?.pendingInviteCode ?? makeInviteCode("INSP");

  const { exists: userExists } = await getDocumentData<AppUser>(COLLECTIONS.users, userId);
  await setDocument(
    COLLECTIONS.users,
    userId,
    {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      role: "inspector",
      ...(userExists ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { merge: true },
  );

  const expiresAt = dateToTimestamp(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
  await setDocument(
    COLLECTIONS.memberships,
    membershipId,
    {
      id: membershipId,
      userId,
      organizationId,
      role: "INSPECTOR",
      status: "INVITED",
      assignedBuildingIds: buildingId ? [buildingId] : [],
      pendingInviteCode: code,
      ...(keeper ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { merge: true },
  );
  await setDocument(COLLECTIONS.inviteCodes, code, {
    organizationId,
    role: "INSPECTOR",
    inviteeEmail: trimmedEmail,
    inviteeName: trimmedName,
    assignedBuildingIds: buildingId ? [buildingId] : [],
    createdAt: now,
    expiresAt,
  });
  await cleanupDuplicateInviteMatches(existingMatches, membershipId);

  const emailSent = await sendInviteEmail(currentUser, {
    organizationId,
    role: "INSPECTOR",
    inviteCode: code,
    inviteeEmail: trimmedEmail,
    inviteeName: trimmedName,
  });

  return { inviteCode: code, emailSent };
}

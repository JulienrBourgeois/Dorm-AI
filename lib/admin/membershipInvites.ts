import type { User } from "firebase/auth";
import {
  COLLECTIONS,
  dateToTimestamp,
  setDocument,
} from "@/app/lib/firebase/firestore";
import { triggerMembershipInviteEmail } from "@/lib/email/triggerFromClient";

export function makeInviteCode(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

function placeholderUserId(kind: "tenant" | "inspector") {
  const suffix = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return kind === "tenant" ? `invite_tenant_${suffix}` : `invite_inspector_${suffix}`;
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

  const userId = placeholderUserId("tenant");
  const now = dateToTimestamp(new Date());
  await setDocument(COLLECTIONS.users, userId, {
    id: userId,
    name: trimmedName,
    email: trimmedEmail,
    role: "tenant",
    createdAt: now,
    updatedAt: now,
  });

  const membershipId = `${userId}-${organizationId}`;
  const code = makeInviteCode("TEN");
  const expiresAt = dateToTimestamp(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
  await setDocument(COLLECTIONS.memberships, membershipId, {
    id: membershipId,
    userId,
    organizationId,
    role: "TENANT",
    status: "INVITED",
    roomId: roomId || undefined,
    pendingInviteCode: code,
    createdAt: now,
    updatedAt: now,
  });
  await setDocument(COLLECTIONS.inviteCodes, code, {
    organizationId,
    role: "TENANT",
    inviteeEmail: trimmedEmail,
    inviteeName: trimmedName,
    roomId: roomId || null,
    createdAt: now,
    expiresAt,
  });

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

  const userId = placeholderUserId("inspector");
  const now = dateToTimestamp(new Date());
  await setDocument(COLLECTIONS.users, userId, {
    id: userId,
    name: trimmedName,
    email: trimmedEmail,
    role: "inspector",
    createdAt: now,
    updatedAt: now,
  });

  const membershipId = `${userId}-${organizationId}`;
  const code = makeInviteCode("INSP");
  const expiresAt = dateToTimestamp(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
  await setDocument(COLLECTIONS.memberships, membershipId, {
    id: membershipId,
    userId,
    organizationId,
    role: "INSPECTOR",
    status: "INVITED",
    assignedBuildingIds: buildingId ? [buildingId] : [],
    pendingInviteCode: code,
    createdAt: now,
    updatedAt: now,
  });
  await setDocument(COLLECTIONS.inviteCodes, code, {
    organizationId,
    role: "INSPECTOR",
    inviteeEmail: trimmedEmail,
    inviteeName: trimmedName,
    assignedBuildingIds: buildingId ? [buildingId] : [],
    createdAt: now,
    expiresAt,
  });

  const emailSent = await sendInviteEmail(currentUser, {
    organizationId,
    role: "INSPECTOR",
    inviteCode: code,
    inviteeEmail: trimmedEmail,
    inviteeName: trimmedName,
  });

  return { inviteCode: code, emailSent };
}

import type { MembershipStatus } from "@/types";

export type MembershipRecordLike = {
  membershipId: string;
  userId: string;
  email: string;
  status: MembershipStatus;
  pendingInviteCode?: string;
};

export function isInvitePlaceholderUserId(userId: string): boolean {
  return userId.startsWith("invite_tenant_") || userId.startsWith("invite_inspector_");
}

function normalizedEmailKey(row: MembershipRecordLike): string {
  const email = row.email.trim().toLowerCase();
  if (email && email !== "—") return email;
  return `membership:${row.membershipId}`;
}

function rowScore(row: MembershipRecordLike): number {
  let score = 0;

  if (row.status === "ACTIVE") {
    score += 100;
  } else if (row.status === "INVITED") {
    score += 10;
  }

  if (!isInvitePlaceholderUserId(row.userId)) {
    score += 5;
  }

  if (row.pendingInviteCode) {
    score += 1;
  }

  return score;
}

export function preferMembershipRecord<T extends MembershipRecordLike>(current: T, next: T): T {
  return rowScore(next) > rowScore(current) ? next : current;
}

export function dedupeMembershipRecordsByEmail<T extends MembershipRecordLike>(rows: T[]): T[] {
  const keepers = new Map<string, T>();

  for (const row of rows) {
    const key = normalizedEmailKey(row);
    const existing = keepers.get(key);
    keepers.set(key, existing ? preferMembershipRecord(existing, row) : row);
  }

  return rows.filter((row) => keepers.get(normalizedEmailKey(row)) === row);
}

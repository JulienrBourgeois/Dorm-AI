import { describe, expect, it } from "vitest";
import {
  dedupeMembershipRecordsByEmail,
  isInvitePlaceholderUserId,
  preferMembershipRecord,
} from "@/lib/admin/membershipRecords";
import type { MembershipStatus } from "@/types";

function row(overrides: Partial<{
  membershipId: string;
  userId: string;
  email: string;
  status: MembershipStatus;
  pendingInviteCode?: string;
}> = {}) {
  return {
    membershipId: "membership-1",
    userId: "user-1",
    email: "person@example.com",
    status: "INVITED" as MembershipStatus,
    pendingInviteCode: undefined,
    ...overrides,
  };
}

describe("isInvitePlaceholderUserId", () => {
  it("detects tenant placeholder ids", () => {
    expect(isInvitePlaceholderUserId("invite_tenant_abc123")).toBe(true);
  });

  it("detects inspector placeholder ids", () => {
    expect(isInvitePlaceholderUserId("invite_inspector_abc123")).toBe(true);
  });

  it("ignores real auth ids", () => {
    expect(isInvitePlaceholderUserId("firebase_uid_123")).toBe(false);
  });
});

describe("preferMembershipRecord", () => {
  it("prefers an active record over an invited placeholder", () => {
    const active = row({
      membershipId: "active",
      userId: "real-user",
      status: "ACTIVE",
    });
    const invited = row({
      membershipId: "invited",
      userId: "invite_tenant_tmp",
      status: "INVITED",
      pendingInviteCode: "TEN-123",
    });

    expect(preferMembershipRecord(invited, active)).toBe(active);
  });

  it("prefers a real inactive record over a placeholder invite", () => {
    const realInvite = row({
      membershipId: "real-invite",
      userId: "real-user",
      status: "INVITED",
      pendingInviteCode: "TEN-456",
    });
    const placeholderInvite = row({
      membershipId: "invited",
      userId: "invite_inspector_tmp",
      status: "INVITED",
      pendingInviteCode: "INSP-123",
    });

    expect(preferMembershipRecord(placeholderInvite, realInvite)).toBe(realInvite);
  });
});

describe("dedupeMembershipRecordsByEmail", () => {
  it("keeps only the active row for duplicate emails", () => {
    const rows = [
      row({
        membershipId: "invited",
        userId: "invite_tenant_tmp",
        status: "INVITED",
        pendingInviteCode: "TEN-123",
      }),
      row({
        membershipId: "active",
        userId: "real-user",
        status: "ACTIVE",
      }),
    ];

    expect(dedupeMembershipRecordsByEmail(rows)).toEqual([rows[1]]);
  });

  it("uses membership id when no usable email exists", () => {
    const rows = [
      row({ membershipId: "a", email: "—", userId: "invite_tenant_a" }),
      row({ membershipId: "b", email: "—", userId: "invite_tenant_b" }),
    ];

    expect(dedupeMembershipRecordsByEmail(rows)).toEqual(rows);
  });
});

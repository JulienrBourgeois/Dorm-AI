import type { MembershipRole, MembershipStatus } from "@/types";

export function isActiveMembership(status: MembershipStatus | undefined): boolean {
  return status === "ACTIVE";
}

export function hasMembershipRole(
  role: MembershipRole | undefined,
  expectedRole: MembershipRole,
): boolean {
  return role === expectedRole;
}

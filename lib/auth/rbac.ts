import type { MembershipRole, MembershipStatus, UserRole } from "@/types";

export function isActiveMembership(status: MembershipStatus | undefined): boolean {
  return status === "ACTIVE";
}

export function hasMembershipRole(
  role: MembershipRole | undefined,
  expectedRole: MembershipRole,
): boolean {
  return role === expectedRole;
}

export function getPortalPathByUserRole(
  role: UserRole | undefined,
): "/admin/dashboard" | "/inspector" | "/tenant" {
  if (role === "inspector") return "/inspector";
  if (role === "tenant") return "/tenant";
  return "/admin/dashboard";
}

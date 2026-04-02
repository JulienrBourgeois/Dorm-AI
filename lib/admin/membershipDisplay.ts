import type { MembershipStatus } from "@/types";

/** Short label for table badges and UI (sentence case). */
export function membershipStatusLabel(status: MembershipStatus): string {
  if (status === "ACTIVE") return "Active";
  if (status === "INVITED") return "Invited";
  if (status === "INACTIVE") return "Inactive";
  return status;
}

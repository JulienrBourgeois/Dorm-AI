import type { User } from "firebase/auth";
import { where } from "firebase/firestore";
import { getDocumentData, COLLECTIONS } from "@/app/lib/firebase/firestore";
import { queryCollection } from "@/app/lib/firebase/firestore";
import { getPortalPathByUserRole } from "@/lib/auth/rbac";
import { upsertUserDoc } from "@/lib/auth/userBootstrap";
import type { UserRole } from "@/types";

export type PortalPath =
  | "/setup-funnel"
  | "/admin/dashboard"
  | "/inspector"
  | "/tenant"
  | "/home/dashboard";

function membershipRoleForUserRole(role: UserRole | undefined): "ADMIN" | "INSPECTOR" | "TENANT" | null {
  if (role === "inspector") return "INSPECTOR";
  if (role === "tenant") return "TENANT";
  if (role === "property_manager") return "ADMIN";
  return null;
}

/**
 * Returns the path a logged-in user should be sent to by role:
 * inspector → /inspector, tenant → /tenant, property_manager → /admin/dashboard.
 */
export async function getRedirectPathForUser(user: User): Promise<PortalPath> {
  const { created } = await upsertUserDoc(user);
  if (created) return "/setup-funnel";

  const { data } = await getDocumentData<{ dateOfBirth?: string; role?: UserRole }>(COLLECTIONS.users, user.uid);
  if (!data?.dateOfBirth) return "/setup-funnel";
  const membershipRole = membershipRoleForUserRole(data.role);
  if (membershipRole) {
    const membershipSnap = await queryCollection(
      COLLECTIONS.memberships,
      where("userId", "==", user.uid),
      where("role", "==", membershipRole),
      where("status", "==", "ACTIVE"),
    );
    if (membershipSnap.empty && membershipRole !== "ADMIN") {
      return "/home/dashboard";
    }
  }
  return getPortalPathByUserRole(data.role);
}

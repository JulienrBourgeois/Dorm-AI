/**
 * Server-only: get redirect path for a user by uid (e.g. from verified session cookie).
 * Used by API route and middleware flow.
 * Routes by role: inspector → /inspector, tenant → /tenant, else → /admin/dashboard.
 */
import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";
import { getPortalPathByUserRole } from "@/lib/auth/rbac";
import type { UserRole } from "@/types";

export type RedirectPath =
  | "/admin/dashboard"
  | "/setup-funnel"
  | "/inspector"
  | "/tenant"
  | "/home/dashboard";

function membershipRoleForUserRole(role: UserRole | undefined): "ADMIN" | "INSPECTOR" | "TENANT" | null {
  if (role === "inspector") return "INSPECTOR";
  if (role === "tenant") return "TENANT";
  if (role === "property_manager") return "ADMIN";
  return null;
}

export async function getRedirectPathForUid(uid: string): Promise<RedirectPath> {
  const firestore = getAdminFirestore();
  const doc = await firestore.collection(COLLECTIONS.users).doc(uid).get();
  const data = doc.data() as { dateOfBirth?: string; role?: UserRole } | undefined;
  if (!data?.dateOfBirth) return "/setup-funnel";
  const membershipRole = membershipRoleForUserRole(data.role);
  if (membershipRole) {
    const membershipSnap = await firestore
      .collection(COLLECTIONS.memberships)
      .where("userId", "==", uid)
      .where("role", "==", membershipRole)
      .where("status", "==", "ACTIVE")
      .limit(1)
      .get();
    if (membershipSnap.empty && membershipRole !== "ADMIN") {
      return "/home/dashboard";
    }
  }
  return getPortalPathByUserRole(data.role);
}

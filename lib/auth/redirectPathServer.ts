/**
 * Server-only: redirect targets for session cookie flows (middleware, /api/auth/redirect-path).
 * Uses memberships for admin/inspector/tenant gates — not users.role.
 */
import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";
import type { MembershipRole } from "@/types";

async function loadActiveMembershipRoles(uid: string): Promise<Set<MembershipRole>> {
  const firestore = getAdminFirestore();
  const snap = await firestore
    .collection(COLLECTIONS.memberships)
    .where("userId", "==", uid)
    .where("status", "==", "ACTIVE")
    .get();
  const roles = new Set<MembershipRole>();
  for (const doc of snap.docs) {
    const r = doc.data().role as MembershipRole | undefined;
    if (r === "ADMIN" || r === "INSPECTOR" || r === "TENANT") roles.add(r);
  }
  return roles;
}

/** Default post-login landing: always home hub (user picks org + portal). */
async function membershipPortal(): Promise<string> {
  return "/home/dashboard";
}

/**
 * @param pathname — request path from middleware or redirect-path API (e.g. /admin/buildings).
 */
export async function getRedirectPathForUid(
  uid: string,
  pathname: string = "/",
): Promise<string> {
  const firestore = getAdminFirestore();
  const doc = await firestore.collection(COLLECTIONS.users).doc(uid).get();
  const data = doc.data() as { dateOfBirth?: string } | undefined;
  if (!data?.dateOfBirth) return "/setup-funnel";

  const roles = await loadActiveMembershipRoles(uid);
  const hasAdmin = roles.has("ADMIN");
  const hasInspector = roles.has("INSPECTOR");
  const hasTenant = roles.has("TENANT");

  if (pathname === "/home" || pathname.startsWith("/home/")) {
    return "/home/dashboard";
  }

  if (pathname.startsWith("/admin")) {
    if (!hasAdmin) {
      if (hasInspector) return "/inspector";
      if (hasTenant) return "/tenant";
      return "/home/dashboard";
    }
    return pathname;
  }

  if (pathname.startsWith("/inspector")) {
    if (!hasInspector) {
      if (hasAdmin) return "/home/dashboard";
      if (hasTenant) return "/tenant";
      return "/home/dashboard";
    }
    return pathname;
  }

  if (pathname.startsWith("/tenant")) {
    if (!hasTenant) {
      if (hasAdmin) return "/home/dashboard";
      if (hasInspector) return "/inspector";
      return "/home/dashboard";
    }
    return pathname;
  }

  return membershipPortal();
}

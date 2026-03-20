/**
 * Server-only: get redirect path for a user by uid (e.g. from verified session cookie).
 * Used by API route and middleware flow.
 * Routes by role: inspector → /inspector, tenant → /tenant, else → /admin/dashboard.
 */
import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";
import type { UserRole } from "@/types";

export type RedirectPath = "/admin/dashboard" | "/setup-funnel" | "/inspector" | "/tenant";

export async function getRedirectPathForUid(uid: string): Promise<RedirectPath> {
  const firestore = getAdminFirestore();
  const doc = await firestore.collection(COLLECTIONS.users).doc(uid).get();
  const data = doc.data() as { dateOfBirth?: string; role?: UserRole } | undefined;
  if (!data?.dateOfBirth) return "/setup-funnel";
  if (data.role === "inspector") return "/inspector";
  if (data.role === "tenant") return "/tenant";
  return "/admin/dashboard";
}

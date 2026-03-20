import type { User } from "firebase/auth";
import { getDocumentData, COLLECTIONS } from "@/app/lib/firebase/firestore";
import { upsertUserDoc } from "@/lib/auth/userBootstrap";
import type { UserRole } from "@/types";

export type PortalPath = "/setup-funnel" | "/admin/dashboard" | "/inspector" | "/tenant";

/**
 * Returns the path a logged-in user should be sent to by role:
 * inspector → /inspector, tenant → /tenant, property_manager → /admin/dashboard.
 */
export async function getRedirectPathForUser(user: User): Promise<PortalPath> {
  const { created } = await upsertUserDoc(user);
  if (created) return "/setup-funnel";

  const { data } = await getDocumentData<{ dateOfBirth?: string; role?: UserRole }>(COLLECTIONS.users, user.uid);
  if (!data?.dateOfBirth) return "/setup-funnel";
  if (data.role === "inspector") return "/inspector";
  if (data.role === "tenant") return "/tenant";
  return "/admin/dashboard";
}

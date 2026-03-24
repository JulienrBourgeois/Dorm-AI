import type { User } from "firebase/auth";
import { getDocumentData, COLLECTIONS } from "@/app/lib/firebase/firestore";
import { upsertUserDoc } from "@/lib/auth/userBootstrap";

export type PortalPath = "/setup-funnel" | "/home/dashboard";

/**
 * After client auth: profile incomplete → setup; otherwise everyone lands on the home hub.
 */
export async function getRedirectPathForUser(user: User): Promise<PortalPath> {
  const { created } = await upsertUserDoc(user);
  if (created) return "/setup-funnel";

  const { data } = await getDocumentData<{ dateOfBirth?: string }>(
    COLLECTIONS.users,
    user.uid,
  );
  if (!data?.dateOfBirth) return "/setup-funnel";
  return "/home/dashboard";
}

import type { User } from "firebase/auth";
import { getDocumentData, COLLECTIONS } from "@/app/lib/firebase/firestore";
import { upsertUserDoc } from "@/lib/auth/userBootstrap";

export type PortalPath = "/setup-funnel" | "/home/dashboard";

export type UserRedirectResult = {
  path: PortalPath;
  /** True only when this auth session created a new Firestore user doc (first signup). */
  isNewUser: boolean;
};

/**
 * After client auth: profile incomplete → setup; otherwise everyone lands on the home hub.
 */
export async function getRedirectPathForUser(user: User): Promise<UserRedirectResult> {
  const { created } = await upsertUserDoc(user);
  if (created) {
    return { path: "/setup-funnel", isNewUser: true };
  }

  const { data } = await getDocumentData<{ dateOfBirth?: string }>(
    COLLECTIONS.users,
    user.uid,
  );
  if (!data?.dateOfBirth) {
    return { path: "/setup-funnel", isNewUser: false };
  }
  return { path: "/home/dashboard", isNewUser: false };
}

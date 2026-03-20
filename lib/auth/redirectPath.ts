import type { User } from "firebase/auth";
import { getDocumentData, COLLECTIONS } from "@/app/lib/firebase/firestore";
import { upsertUserDoc } from "@/lib/auth/userBootstrap";

/**
 * Returns the path a logged-in user should be sent to (setup-funnel or home).
 * Use on landing and signup so authenticated users are redirected.
 */
export async function getRedirectPathForUser(user: User): Promise<"/setup-funnel" | "/home"> {
  const { created } = await upsertUserDoc(user);
  if (created) return "/setup-funnel";

  const { data } = await getDocumentData<{ dateOfBirth?: string }>(COLLECTIONS.users, user.uid);
  return data?.dateOfBirth ? "/home" : "/setup-funnel";
}

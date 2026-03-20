/**
 * Server-only: get redirect path for a user by uid (e.g. from verified session cookie).
 * Used by API route and middleware flow.
 */
import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";

export type RedirectPath = "/home" | "/setup-funnel";

export async function getRedirectPathForUid(uid: string): Promise<RedirectPath> {
  const firestore = getAdminFirestore();
  const doc = await firestore.collection(COLLECTIONS.users).doc(uid).get();
  const data = doc.data() as { dateOfBirth?: string } | undefined;
  return data?.dateOfBirth ? "/home" : "/setup-funnel";
}

import type { User } from "firebase/auth";
import { signOutUser } from "@/app/lib/firebase/auth";
import { getDocumentData, COLLECTIONS } from "@/app/lib/firebase/firestore";
import { clearSessionCookie } from "@/lib/admin/adminAuth";
import { upsertUserDoc } from "@/lib/auth/userBootstrap";

/**
 * Ensures `users/{uid}` exists in the Firestore instance for this build (env / database id).
 * If the document cannot be read or cannot be created, signs out and clears `__session`
 * so middleware does not treat the user as logged in for this app.
 */
export async function ensureFirestoreUserForSession(user: User): Promise<boolean> {
  try {
    const { exists } = await getDocumentData(COLLECTIONS.users, user.uid);
    if (!exists) {
      await upsertUserDoc(user);
    }
    return true;
  } catch {
    try {
      await clearSessionCookie();
    } catch {
      /* ignore */
    }
    try {
      await signOutUser();
    } catch {
      /* ignore */
    }
    return false;
  }
}

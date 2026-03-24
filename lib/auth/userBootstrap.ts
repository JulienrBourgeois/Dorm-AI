/**
 * User bootstrap: create or update the user document after Firebase Auth.
 * Role-agnostic; role assignment is deferred to a post-signup setup funnel.
 */
import type { User } from "firebase/auth";
import {
  setDocument,
  getDocumentData,
  COLLECTIONS,
  dateToTimestamp,
} from "@/app/lib/firebase/firestore";

/**
 * Create or update the user document after auth.
 * @returns { created: true } for new signups, { created: false } for returning users.
 */
export async function upsertUserDoc(user: User): Promise<{ created: boolean }> {
  const { exists } = await getDocumentData(COLLECTIONS.users, user.uid);
  const now = dateToTimestamp(new Date());

  if (!exists) {
    await setDocument(COLLECTIONS.users, user.uid, {
      id: user.uid,
      name: user.displayName ?? "",
      email: user.email ?? "",
      createdAt: now,
      updatedAt: now,
    });
    return { created: true };
  }

  await setDocument(
    COLLECTIONS.users,
    user.uid,
    {
      id: user.uid,
      email: user.email ?? "",
      updatedAt: now,
    },
    { merge: true }
  );
  return { created: false };
}

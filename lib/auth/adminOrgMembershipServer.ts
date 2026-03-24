/**
 * Server-only: verify Firestore membership for org-scoped admin routes.
 */
import { getAdminFirestore } from "@/app/lib/firebase/admin";
import { COLLECTIONS } from "@/app/lib/firebase/firestore/collections";

export async function userIsActiveAdminForOrganization(
  uid: string,
  organizationId: string,
): Promise<boolean> {
  const oid = organizationId.trim();
  if (!oid) return false;
  const firestore = getAdminFirestore();
  const docId = `${uid}-${oid}`;
  const snap = await firestore.collection(COLLECTIONS.memberships).doc(docId).get();
  if (!snap.exists) return false;
  const data = snap.data();
  return (
    data?.userId === uid &&
    data?.organizationId === oid &&
    data?.role === "ADMIN" &&
    data?.status === "ACTIVE"
  );
}

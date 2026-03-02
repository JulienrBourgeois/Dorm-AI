/**
 * One-time read of Firestore documents or collections.
 * @see https://firebase.google.com/docs/firestore/query-data/get-data
 */
import type { DocumentSnapshot } from "firebase/firestore";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../app";

/**
 * Get a single document. Returns the Firestore DocumentSnapshot.
 * @param collectionPath - Collection path (e.g. "users")
 * @param documentId - Document ID
 */
export function getDocument(
  collectionPath: string,
  documentId: string
): Promise<DocumentSnapshot> {
  return getDoc(doc(db, collectionPath, documentId));
}

/**
 * Get document data and existence in one call. Convenience for read-once usage.
 * @param collectionPath - Collection path
 * @param documentId - Document ID
 * @returns { data, exists } — data is undefined if document does not exist
 */
export async function getDocumentData<T = unknown>(
  collectionPath: string,
  documentId: string
): Promise<{ data: T | undefined; exists: boolean }> {
  const snapshot = await getDocument(collectionPath, documentId);
  return {
    data: snapshot.exists() ? (snapshot.data() as T) : undefined,
    exists: snapshot.exists(),
  };
}

/**
 * Get all documents in a collection (one-time read). Returns Firestore QuerySnapshot.
 * @param collectionPath - Collection path (e.g. "posts")
 */
export function getCollection(collectionPath: string) {
  return getDocs(collection(db, collectionPath));
}

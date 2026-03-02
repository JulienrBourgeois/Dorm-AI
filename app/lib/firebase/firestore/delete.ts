/**
 * Delete Firestore documents.
 * @see https://firebase.google.com/docs/firestore/manage-data/delete-data
 */
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../app";

/**
 * Delete a document by path. No-op if the document does not exist.
 * @param collectionPath - Collection path (e.g. "users")
 * @param documentId - Document ID
 */
export function deleteDocument(
  collectionPath: string,
  documentId: string
): Promise<void> {
  return deleteDoc(doc(db, collectionPath, documentId));
}

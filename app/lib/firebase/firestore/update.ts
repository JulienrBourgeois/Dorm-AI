/**
 * Update existing Firestore document fields (partial update).
 * @see https://firebase.google.com/docs/firestore/manage-data/add-data#update-data
 */
import type { UpdateData } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../app";

/**
 * Update specific fields in a document. Fails if the document does not exist.
 * Only the given fields are updated; other fields are left unchanged.
 * @param collectionPath - Collection path (e.g. "users")
 * @param documentId - Document ID
 * @param data - Partial data to merge (field paths or dot notation for nested)
 */
export function updateDocument(
  collectionPath: string,
  documentId: string,
  data: UpdateData<object>
) {
  return updateDoc(doc(db, collectionPath, documentId), data);
}

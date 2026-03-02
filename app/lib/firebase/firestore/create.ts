/**
 * Create documents in Firestore (set with explicit ID or add with auto ID).
 * @see https://firebase.google.com/docs/firestore/manage-data/add-data
 */
import type { SetOptions } from "firebase/firestore";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../app";

/**
 * Set a document by ID. Overwrites the document if it exists unless merge is true.
 * @param collectionPath - Collection path (e.g. "users")
 * @param documentId - Document ID
 * @param data - Document data
 * @param options - SetOptions: { merge: true } to merge with existing document
 */
export function setDocument<T extends object>(
  collectionPath: string,
  documentId: string,
  data: T,
  options?: SetOptions
) {
  const ref = doc(db, collectionPath, documentId);
  return options ? setDoc(ref, data, options) : setDoc(ref, data);
}

/**
 * Add a new document with an auto-generated ID. Returns the document reference with id.
 * @param collectionPath - Collection path (e.g. "posts")
 * @param data - Document data
 */
export function addDocument<T extends object>(collectionPath: string, data: T) {
  return addDoc(collection(db, collectionPath), data);
}

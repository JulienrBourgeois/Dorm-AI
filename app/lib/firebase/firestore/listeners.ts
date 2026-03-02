/**
 * Realtime Firestore listeners (onSnapshot). Return unsubscribe from Client Components/hooks.
 * @see https://firebase.google.com/docs/firestore/query-data/listen
 */
import type {
  DocumentSnapshot,
  QuerySnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../app";

/**
 * Subscribe to a single document. Call the returned function to unsubscribe.
 * @param collectionPath - Collection path (e.g. "users")
 * @param documentId - Document ID
 * @param onNext - Called with DocumentSnapshot on data or changes
 * @param onError - Optional error callback
 */
export function subscribeDocument(
  collectionPath: string,
  documentId: string,
  onNext: (snapshot: DocumentSnapshot) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = doc(db, collectionPath, documentId);
  return onSnapshot(ref, onNext, onError ?? undefined);
}

/**
 * Subscribe to a collection. Call the returned function to unsubscribe.
 * @param collectionPath - Collection path (e.g. "posts")
 * @param onNext - Called with QuerySnapshot on data or changes
 * @param onError - Optional error callback
 */
export function subscribeCollection(
  collectionPath: string,
  onNext: (snapshot: QuerySnapshot) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ref = collection(db, collectionPath);
  return onSnapshot(ref, onNext, onError ?? undefined);
}

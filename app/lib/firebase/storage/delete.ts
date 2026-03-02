/**
 * Delete objects from Firebase Storage.
 * @see https://firebase.google.com/docs/storage/web/delete-objects
 */
import { deleteObject } from "firebase/storage";
import { getStorageRef } from "./ref";

/**
 * Delete the object at the given path.
 * @param path - Full path in the bucket (e.g. "images/uid/photo.jpg")
 */
export function deleteFile(path: string): Promise<void> {
  return deleteObject(getStorageRef(path));
}

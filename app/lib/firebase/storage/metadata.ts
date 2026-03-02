/**
 * Get file metadata from Firebase Storage.
 * @see https://firebase.google.com/docs/storage/web/file-metadata
 */
import type { FullMetadata } from "firebase/storage";
import { getMetadata } from "firebase/storage";
import { getStorageRef } from "./ref";

/**
 * Get metadata for the object at the given path (contentType, size, updated, etc.).
 * @param path - Full path in the bucket (e.g. "images/photo.jpg")
 */
export function getFileMetadata(path: string): Promise<FullMetadata> {
  return getMetadata(getStorageRef(path));
}

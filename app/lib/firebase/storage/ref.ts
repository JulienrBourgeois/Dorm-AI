/**
 * Storage reference helper. Use a path string to get a Firebase StorageReference.
 * @see https://firebase.google.com/docs/storage/web/upload-files#create_a_reference
 */
import type { StorageReference } from "firebase/storage";
import { ref } from "firebase/storage";
import { storage } from "../app";

/**
 * Get a StorageReference for the given path. Use for upload, download, delete, or list.
 * @param path - Full path in the bucket (e.g. "images/uid/photo.jpg", "videos/clip.mp4")
 */
export function getStorageRef(path: string): StorageReference {
  return ref(storage, path);
}

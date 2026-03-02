/**
 * Get download URLs for Storage objects (images, videos, etc.).
 * @see https://firebase.google.com/docs/storage/web/download-files
 */
import { getDownloadURL } from "firebase/storage";
import { getStorageRef } from "./ref";

/**
 * Get a download URL for the object at the given path. Use for img src, video src, or fetch().
 * @param path - Full path in the bucket (e.g. "images/photo.jpg")
 * @returns Promise resolving to the download URL string
 */
export function getDownloadUrl(path: string): Promise<string> {
  return getDownloadURL(getStorageRef(path));
}

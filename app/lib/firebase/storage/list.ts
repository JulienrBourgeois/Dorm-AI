/**
 * List files and prefixes in Firebase Storage (paginated or full).
 * @see https://firebase.google.com/docs/storage/web/list-files
 */
import type { ListOptions } from "firebase/storage";
import type { ListResult } from "firebase/storage";
import { list, listAll } from "firebase/storage";
import { getStorageRef } from "./ref";

/**
 * List files and prefixes under path with pagination. Use for large directories.
 * @param path - Prefix path (e.g. "images/uid")
 * @param options - maxResults, pageToken for pagination
 */
export function listFiles(
  path: string,
  options?: ListOptions
): Promise<ListResult> {
  return list(getStorageRef(path), options);
}

/**
 * List all items and prefixes under path in one call. Use for small directories (buffers in memory).
 * @param path - Prefix path (e.g. "images/uid")
 */
export function listAllFiles(path: string): Promise<ListResult> {
  return listAll(getStorageRef(path));
}

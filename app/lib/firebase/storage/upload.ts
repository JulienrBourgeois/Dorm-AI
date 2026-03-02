/**
 * Upload files to Firebase Storage (bytes and resumable).
 * @see https://firebase.google.com/docs/storage/web/upload-files
 */
import type { UploadMetadata } from "firebase/storage";
import type { UploadResult, UploadTask } from "firebase/storage";
import { uploadBytes, uploadBytesResumable } from "firebase/storage";
import { getStorageRef } from "./ref";

/**
 * Upload data to the given path. Resolves when upload completes.
 * @param path - Full path in the bucket (e.g. "images/uid/photo.jpg")
 * @param data - File, Blob, Uint8Array, or ArrayBuffer
 * @param metadata - Optional contentType, customMetadata, etc.
 */
export function uploadFile(
  path: string,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata
): Promise<UploadResult> {
  return uploadBytes(getStorageRef(path), data, metadata);
}

/**
 * Upload with progress support. Returns an UploadTask; use .on("state_changed", ...) for progress, pause, resume, cancel.
 * @param path - Full path in the bucket
 * @param data - File, Blob, Uint8Array, or ArrayBuffer
 * @param metadata - Optional contentType, customMetadata, etc.
 */
export function uploadFileResumable(
  path: string,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata
): UploadTask {
  return uploadBytesResumable(getStorageRef(path), data, metadata);
}

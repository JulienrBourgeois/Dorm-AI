const PROFILE_PHOTO_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** Safe segment for Storage object names (shared with org thumbnails). */
export function sanitizeFileName(name: string): string {
  const safe = name.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe || "profile-photo";
}

export function buildUserProfilePhotoPath(userId: string, fileName: string): string {
  return `users/${userId}/profile/${Date.now()}-${sanitizeFileName(fileName)}`;
}

export function validateProfilePhotoFile(file: File): string | null {
  if (!PROFILE_PHOTO_ALLOWED_TYPES.has(file.type)) {
    return "Please choose a JPG, PNG, WEBP, or HEIC image.";
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return "Please use an image smaller than 5 MB.";
  }
  return null;
}

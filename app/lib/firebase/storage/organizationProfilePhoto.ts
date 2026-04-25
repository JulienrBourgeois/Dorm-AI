import { sanitizeFileName } from "./profilePhoto";

const PHOTO_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** Same pattern as user profile: org-scoped folder under `organizations/{id}/profile/`. */
export function buildOrganizationProfilePhotoPath(organizationId: string, fileName: string): string {
  return `organizations/${organizationId}/profile/${Date.now()}-${sanitizeFileName(fileName)}`;
}

export function validateOrganizationProfilePhotoFile(file: File): string | null {
  if (!PHOTO_ALLOWED_TYPES.has(file.type)) {
    return "Please choose a JPG, PNG, WEBP, or HEIC image.";
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return "Please use an image smaller than 5 MB.";
  }
  return null;
}

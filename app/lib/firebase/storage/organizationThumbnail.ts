import { sanitizeFileName } from "./profilePhoto";

const THUMB_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const THUMB_MAX_BYTES = 5 * 1024 * 1024;

export function buildOrganizationThumbnailPath(organizationId: string, fileName: string): string {
  return `organizations/${organizationId}/thumbnail/${Date.now()}-${sanitizeFileName(fileName)}`;
}

export function validateOrganizationThumbnailFile(file: File): string | null {
  if (!THUMB_ALLOWED_TYPES.has(file.type)) {
    return "Please choose a JPG, PNG, WEBP, or HEIC image.";
  }
  if (file.size > THUMB_MAX_BYTES) {
    return "Please use an image smaller than 5 MB.";
  }
  return null;
}

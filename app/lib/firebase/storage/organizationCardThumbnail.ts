import { sanitizeFileName } from "./profilePhoto";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAX_BYTES = 8 * 1024 * 1024;

export function buildOrganizationCardThumbnailPath(organizationId: string, fileName: string): string {
  return `organizations/${organizationId}/thumbnail/${Date.now()}-${sanitizeFileName(fileName)}`;
}

export function validateOrganizationCardThumbnailFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) {
    return "Please choose a JPG, PNG, WEBP, or HEIC image.";
  }
  if (file.size > MAX_BYTES) {
    return "Please use an image smaller than 8 MB.";
  }
  return null;
}

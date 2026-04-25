import type { Organization } from "@/types/dorm";

/**
 * Card / listing banner image. Prefer `cardThumbnailPath`; legacy Firestore `thumbnailStoragePath`
 * may still point at Storage `organizations/.../thumbnail/...` from older releases.
 */
export function getOrganizationCardThumbnailStoragePath(
  org: (Partial<Organization> & { thumbnailStoragePath?: string }) | null | undefined,
): string | undefined {
  if (!org) return undefined;
  const card = org.cardThumbnailPath?.trim();
  if (card) return card;
  return org.thumbnailStoragePath?.trim() || undefined;
}

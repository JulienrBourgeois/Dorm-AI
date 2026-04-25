import type { Organization } from "@/types/dorm";

/** Logo only: `profilePhotoPath`. Does not use card thumbnail fields. */
export function getOrganizationProfilePhotoStoragePath(
  org: Partial<Organization> | null | undefined,
): string | undefined {
  if (!org) return undefined;
  return org.profilePhotoPath?.trim() || undefined;
}

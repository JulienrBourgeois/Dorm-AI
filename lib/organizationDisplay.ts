import type { Organization, OrganizationType } from "@/types/dorm";

const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  APARTMENT_COMPLEX: "Apartment complex",
  UNIVERSITY: "University",
  CORPORATE_BUILDING: "Corporate building",
  MIXED_USE: "Mixed use",
  OTHER: "Other",
};

export const ORGANIZATION_TYPE_OPTIONS: { value: OrganizationType; label: string }[] =
  (Object.keys(ORGANIZATION_TYPE_LABELS) as OrganizationType[]).map((value) => ({
    value,
    label: ORGANIZATION_TYPE_LABELS[value],
  }));

export function organizationTypeLabel(
  type: OrganizationType | undefined,
): string | null {
  if (!type) return null;
  return ORGANIZATION_TYPE_LABELS[type] ?? null;
}

/** Secondary line on org cards: type and city/state when present; else legacy slug. */
export function formatOrganizationCardSubtitle(
  org: Pick<Organization, "organizationType" | "city" | "state" | "slug">,
): string {
  const parts: string[] = [];
  const t = organizationTypeLabel(org.organizationType);
  if (t) parts.push(t);
  const city = org.city?.trim();
  const state = org.state?.trim();
  if (city && state) parts.push(`${city}, ${state}`);
  else if (city) parts.push(city);
  else if (state) parts.push(state);
  if (parts.length > 0) return parts.join(" · ");
  return org.slug?.trim() ?? "";
}

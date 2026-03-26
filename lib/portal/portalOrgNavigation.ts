import type { MembershipRole } from "@/types";

export type PortalKind = "admin" | "inspector" | "tenant";

/** Membership rows visible for the current portal (one role per portal surface). */
export function orgEntriesForPortal<T extends { membershipRole: string }>(
  entries: T[],
  portal: PortalKind,
): T[] {
  const role =
    portal === "admin" ? "ADMIN" : portal === "inspector" ? "INSPECTOR" : "TENANT";
  return entries.filter((e) => e.membershipRole === role);
}

type Entry = { id: string; membershipRole: string };

/** Whether this org row is the active selection for the current portal + URL. */
export function isOrgRowSelectedForPortal(
  portal: PortalKind,
  organizationId: string,
  entry: Entry,
): boolean {
  if (!organizationId || entry.id !== organizationId) return false;
  if (portal === "admin") return entry.membershipRole === "ADMIN";
  if (portal === "inspector") return entry.membershipRole === "INSPECTOR";
  if (portal === "tenant") return entry.membershipRole === "TENANT";
  return false;
}

/**
 * Navigate to the right place when picking an org from the shared selector.
 * Preserves `view` on inspector when switching org within the inspector portal.
 */
export function hrefForOrgEntry(
  portal: PortalKind,
  pathname: string,
  searchParams: URLSearchParams,
  entry: Entry,
): string {
  const oid = entry.id;
  const role = entry.membershipRole as MembershipRole | string;

  if (role === "ADMIN") {
    if (portal === "admin") {
      const onAdmin =
        pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
      const base = onAdmin ? pathname : "/admin/dashboard";
      const next = new URLSearchParams(searchParams.toString());
      next.set("organizationId", oid);
      const q = next.toString();
      return q ? `${base}?${q}` : base;
    }
    return `/admin/dashboard?organizationId=${encodeURIComponent(oid)}`;
  }

  if (role === "INSPECTOR") {
    const next = new URLSearchParams();
    next.set("organizationId", oid);
    if (portal === "inspector") {
      const v = searchParams.get("view");
      if (v) next.set("view", v);
    }
    const q = next.toString();
    return q ? `/inspector?${q}` : "/inspector";
  }

  if (role === "TENANT") {
    const next = new URLSearchParams();
    next.set("organizationId", oid);
    return `/tenant?${next.toString()}`;
  }

  return "/home/dashboard";
}

/** Build `/inspector` URL preserving org + optional view. */
export function inspectorPortalHref(
  organizationId: string,
  view: string,
): string {
  const next = new URLSearchParams();
  if (organizationId) next.set("organizationId", organizationId);
  if (view) next.set("view", view);
  const q = next.toString();
  return q ? `/inspector?${q}` : "/inspector";
}

/** Build `/tenant` URL preserving org (for detail back links). */
export function tenantPortalHref(organizationId: string): string {
  if (!organizationId) return "/tenant";
  return `/tenant?organizationId=${encodeURIComponent(organizationId)}`;
}

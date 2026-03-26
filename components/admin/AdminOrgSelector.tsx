"use client";

import { PortalOrgSelector } from "@/components/portals/PortalOrgSelector";

/** @deprecated Prefer `<PortalOrgSelector portal="admin" />` via UnifiedPortalHeader. */
export function AdminOrgSelector() {
  return <PortalOrgSelector portal="admin" />;
}

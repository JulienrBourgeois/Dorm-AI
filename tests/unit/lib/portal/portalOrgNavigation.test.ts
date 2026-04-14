import { describe, expect, it } from "vitest";
import {
  ALL_ORGANIZATIONS_HUB_HREF,
  hrefForOrgEntry,
  inspectorPortalHref,
  isOrgRowSelectedForPortal,
  orgEntriesForPortal,
  tenantPortalHref,
} from "@/lib/portal/portalOrgNavigation";

describe("ALL_ORGANIZATIONS_HUB_HREF", () => {
  it("is home dashboard", () => {
    expect(ALL_ORGANIZATIONS_HUB_HREF).toBe("/home/dashboard");
  });
});

describe("orgEntriesForPortal", () => {
  const entries = [
    { id: "1", membershipRole: "ADMIN" },
    { id: "2", membershipRole: "INSPECTOR" },
    { id: "3", membershipRole: "TENANT" },
  ];

  it("filters by portal role", () => {
    expect(orgEntriesForPortal(entries, "admin")).toEqual([entries[0]]);
    expect(orgEntriesForPortal(entries, "inspector")).toEqual([entries[1]]);
    expect(orgEntriesForPortal(entries, "tenant")).toEqual([entries[2]]);
  });
});

describe("isOrgRowSelectedForPortal", () => {
  it("requires matching id and role for portal", () => {
    expect(
      isOrgRowSelectedForPortal("admin", "1", {
        id: "1",
        membershipRole: "ADMIN",
      }),
    ).toBe(true);
    expect(
      isOrgRowSelectedForPortal("admin", "2", {
        id: "1",
        membershipRole: "ADMIN",
      }),
    ).toBe(false);
    expect(
      isOrgRowSelectedForPortal("tenant", "1", {
        id: "1",
        membershipRole: "ADMIN",
      }),
    ).toBe(false);
  });
});

describe("hrefForOrgEntry", () => {
  it("builds admin dashboard URL with organizationId", () => {
    const href = hrefForOrgEntry(
      "admin",
      "/admin/dashboard",
      new URLSearchParams(),
      { id: "org1", membershipRole: "ADMIN" },
    );
    expect(href).toContain("organizationId=");
    expect(href).toContain("org1");
  });

  it("builds inspector URL with org", () => {
    const href = hrefForOrgEntry(
      "inspector",
      "/inspector",
      new URLSearchParams(),
      { id: "o1", membershipRole: "INSPECTOR" },
    );
    expect(href).toMatch(/^\/inspector\?/);
    expect(href).toContain("organizationId=o1");
  });

  it("builds tenant URL", () => {
    const href = hrefForOrgEntry(
      "tenant",
      "/tenant",
      new URLSearchParams(),
      { id: "t1", membershipRole: "TENANT" },
    );
    expect(href).toContain("/tenant?");
    expect(href).toContain("organizationId=t1");
  });
});

describe("inspectorPortalHref", () => {
  it("includes view when provided", () => {
    expect(inspectorPortalHref("o1", "map")).toContain("view=map");
  });
});

describe("tenantPortalHref", () => {
  it("encodes organization id", () => {
    expect(tenantPortalHref("a/b")).toContain(encodeURIComponent("a/b"));
  });

  it("returns bare /tenant when empty", () => {
    expect(tenantPortalHref("")).toBe("/tenant");
  });
});

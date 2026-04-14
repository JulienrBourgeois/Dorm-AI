import { describe, expect, it } from "vitest";
import { withAdminOrganizationId } from "@/lib/admin/adminOrgQuery";

describe("withAdminOrganizationId", () => {
  it("appends organizationId query", () => {
    expect(withAdminOrganizationId("/admin/rooms", "org-1")).toBe(
      "/admin/rooms?organizationId=org-1",
    );
  });

  it("merges with existing query", () => {
    expect(withAdminOrganizationId("/admin/rooms?x=1", "org-1")).toBe(
      "/admin/rooms?x=1&organizationId=org-1",
    );
  });

  it("encodes organization id", () => {
    expect(withAdminOrganizationId("/a", "a/b")).toContain(
      encodeURIComponent("a/b"),
    );
  });

  it("returns path when organization id empty", () => {
    expect(withAdminOrganizationId("/admin/rooms", "   ")).toBe("/admin/rooms");
  });
});

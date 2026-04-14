import { describe, expect, it } from "vitest";
import { hasMembershipRole, isActiveMembership } from "@/lib/auth/rbac";

describe("isActiveMembership", () => {
  it("is true only for ACTIVE", () => {
    expect(isActiveMembership("ACTIVE")).toBe(true);
    expect(isActiveMembership("INVITED")).toBe(false);
    expect(isActiveMembership(undefined)).toBe(false);
  });
});

describe("hasMembershipRole", () => {
  it("matches role exactly", () => {
    expect(hasMembershipRole("ADMIN", "ADMIN")).toBe(true);
    expect(hasMembershipRole("TENANT", "ADMIN")).toBe(false);
    expect(hasMembershipRole(undefined, "ADMIN")).toBe(false);
  });
});

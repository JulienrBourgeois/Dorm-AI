import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email/config", () => ({
  getAppOrigin: () => "https://app.example.com",
}));

import { joinInviteAbsoluteUrl } from "@/lib/joinInviteLink";

afterEach(() => {
  vi.clearAllMocks();
});

describe("joinInviteAbsoluteUrl", () => {
  it("builds join URL with uppercase code", () => {
    expect(joinInviteAbsoluteUrl("  abc123  ")).toBe(
      "https://app.example.com/join/ABC123",
    );
  });

  it("adds invitee email query when provided", () => {
    expect(joinInviteAbsoluteUrl("X", "User@Mail.COM")).toBe(
      "https://app.example.com/join/X?e=" + encodeURIComponent("user@mail.com"),
    );
  });
});

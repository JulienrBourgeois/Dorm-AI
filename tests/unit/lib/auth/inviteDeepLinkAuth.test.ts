import { describe, expect, it } from "vitest";
import {
  buildInviteAuthReturnUrl,
  buildInviteJoinPath,
  decideInviteEntry,
} from "@/lib/auth/inviteDeepLinkAuth";

describe("decideInviteEntry", () => {
  it("continues join when signed in with matching invite email", () => {
    expect(decideInviteEntry("person@example.com", "person@example.com", true)).toEqual({
      action: "join",
    });
  });

  it("redirects signed-out existing user to email login", () => {
    expect(decideInviteEntry(null, "person@example.com", true)).toEqual({
      action: "redirect",
      step: "email-login",
      shouldSignOut: false,
    });
  });

  it("redirects signed-out new user to email signup", () => {
    expect(decideInviteEntry(null, "person@example.com", false)).toEqual({
      action: "redirect",
      step: "email-signup",
      shouldSignOut: false,
    });
  });

  it("redirects signed-in wrong email to login and requires sign-out when account exists", () => {
    expect(decideInviteEntry("wrong@example.com", "person@example.com", true)).toEqual({
      action: "redirect",
      step: "email-login",
      shouldSignOut: true,
    });
  });

  it("redirects signed-in wrong email to signup and requires sign-out when account missing", () => {
    expect(decideInviteEntry("wrong@example.com", "person@example.com", false)).toEqual({
      action: "redirect",
      step: "email-signup",
      shouldSignOut: true,
    });
  });

  it("keeps missing invite email links on login-first fallback", () => {
    expect(decideInviteEntry(null, "", false)).toEqual({
      action: "redirect",
      step: "email-login",
      shouldSignOut: false,
    });
  });
});

describe("invite auth URL builders", () => {
  it("builds join return path with uppercase code and normalized email", () => {
    expect(buildInviteJoinPath(" abcd ", "User@Email.Com")).toBe(
      "/join?code=ABCD&e=user%40email.com",
    );
  });

  it("builds signup URL for email signup", () => {
    expect(buildInviteAuthReturnUrl("ab12", "User@Email.Com", "email-signup")).toBe(
      "/signup?step=email-signup&next=%2Fjoin%3Fcode%3DAB12%26e%3Duser%2540email.com&email=user%40email.com",
    );
  });
});

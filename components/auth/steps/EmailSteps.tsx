"use client";

import { Shell, AnimateStep, BackButton, AuthInput, PrimaryButton, TextLink } from "@/components/auth/ui";
import type { AuthFunnelState, AuthFunnelActions } from "@/types/auth/authFunnel";

type EmailStepProps = Pick<
  AuthFunnelState,
  "email" | "password" | "confirmPassword" | "loading" | "joinInviteReturn"
> &
  Pick<AuthFunnelActions, "setEmail" | "setPassword" | "setConfirmPassword" | "goTo" | "goWelcome" | "handleEmailSignUp" | "handleEmailSignIn">;

function InviteHint({ joinInviteReturn, email }: { joinInviteReturn: boolean; email: string }) {
  if (!joinInviteReturn) return null;
  return (
    <p className="w-full rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2 text-left text-sm text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
      You’re finishing an invitation
      {email.trim().includes("@") ? (
        <>
          {" "}
          — use <span className="font-medium">{email.trim()}</span> so it matches the invite.
        </>
      ) : (
        ". Use the same email the invitation was sent to."
      )}
    </p>
  );
}

export function EmailSignUpStep({
  email, password, confirmPassword, loading, joinInviteReturn,
  setEmail, setPassword, setConfirmPassword, goWelcome, goTo, handleEmailSignUp,
}: EmailStepProps) {
  return (
    <Shell>
      <AnimateStep stepKey="email-signup">
        <BackButton onClick={goWelcome} />
        <h1 className="self-start text-3xl font-bold tracking-tight md:text-4xl">Sign up with email:</h1>
        <InviteHint joinInviteReturn={joinInviteReturn} email={email} />
        <form onSubmit={handleEmailSignUp} className="flex w-full flex-col gap-5">
          <AuthInput id="signup-email" type="email" placeholder="Email" value={email} onChange={setEmail} autoComplete="email" autoFocus disabled={loading} />
          <AuthInput id="signup-password" type="password" placeholder="Password" value={password} onChange={setPassword} autoComplete="new-password" disabled={loading} />
          <AuthInput id="signup-confirm" type="password" placeholder="Confirm password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" disabled={loading} />
          <PrimaryButton type="submit" disabled={loading}>{loading ? "Creating account…" : "Sign up"}</PrimaryButton>
        </form>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <TextLink onClick={() => goTo("login-chooser")}>Log in</TextLink>
        </p>
      </AnimateStep>
    </Shell>
  );
}

export function EmailLoginStep({
  email, password, loading, joinInviteReturn,
  setEmail, setPassword, goTo, handleEmailSignIn,
}: EmailStepProps) {
  return (
    <Shell>
      <AnimateStep stepKey="email-login">
        <BackButton onClick={() => goTo("login-chooser")} />
        <h1 className="self-start text-3xl font-bold tracking-tight md:text-4xl">Continue with email:</h1>
        <InviteHint joinInviteReturn={joinInviteReturn} email={email} />
        <form onSubmit={handleEmailSignIn} className="flex w-full flex-col gap-5">
          <AuthInput id="login-email" type="email" placeholder="Email" value={email} onChange={setEmail} autoComplete="email" autoFocus disabled={loading} />
          <AuthInput id="login-password" type="password" placeholder="Password" value={password} onChange={setPassword} autoComplete="current-password" disabled={loading} />
          <PrimaryButton type="submit" disabled={loading}>{loading ? "Logging in…" : "Log in"}</PrimaryButton>
        </form>
        <button type="button" onClick={() => goTo("forgot-password")} className="text-sm font-semibold text-foreground transition-colors hover:text-accent">
          Forgot password?
        </button>
      </AnimateStep>
    </Shell>
  );
}

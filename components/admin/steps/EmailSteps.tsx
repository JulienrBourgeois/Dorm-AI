"use client";

import { Shell, AnimateStep, BackButton, AuthInput, PrimaryButton, TextLink } from "@/components/admin/ui";
import type { AuthFunnelState, AuthFunnelActions } from "@/types/admin/authFunnel";

type EmailStepProps = Pick<AuthFunnelState, "email" | "password" | "confirmPassword" | "loading"> &
  Pick<AuthFunnelActions, "setEmail" | "setPassword" | "setConfirmPassword" | "goTo" | "goWelcome" | "handleEmailSignUp" | "handleEmailSignIn">;

export function EmailSignUpStep({
  email, password, confirmPassword, loading,
  setEmail, setPassword, setConfirmPassword, goWelcome, goTo, handleEmailSignUp,
}: EmailStepProps) {
  return (
    <Shell>
      <AnimateStep stepKey="email-signup">
        <BackButton onClick={goWelcome} />
        <h1 className="self-start text-3xl font-bold tracking-tight">Sign up with email:</h1>
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
  email, password, loading,
  setEmail, setPassword, goTo, handleEmailSignIn,
}: EmailStepProps) {
  return (
    <Shell>
      <AnimateStep stepKey="email-login">
        <BackButton onClick={() => goTo("login-chooser")} />
        <h1 className="self-start text-3xl font-bold tracking-tight">Continue with email:</h1>
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

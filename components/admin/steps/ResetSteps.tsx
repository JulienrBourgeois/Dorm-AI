"use client";

import { Shell, AnimateStep, BackButton, AuthInput, PrimaryButton, CheckCircleIcon } from "@/components/admin/ui";
import type { AuthFunnelState, AuthFunnelActions } from "@/types/admin/authFunnel";

type ResetProps = Pick<AuthFunnelState, "email" | "loading"> &
  Pick<AuthFunnelActions, "setEmail" | "goTo" | "handleForgotPassword">;

export function ForgotPasswordStep({ email, loading, setEmail, goTo, handleForgotPassword }: ResetProps) {
  return (
    <Shell>
      <AnimateStep stepKey="forgot-password">
        <BackButton onClick={() => goTo("email-login")} />
        <h1 className="self-start text-3xl font-bold tracking-tight">Reset password</h1>
        <p className="self-start text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          We&apos;ll confirm your account by sending a link to the email address below.
        </p>
        <form onSubmit={handleForgotPassword} className="flex w-full flex-col gap-5">
          <AuthInput id="reset-email" type="email" placeholder="Email" value={email} onChange={setEmail} autoComplete="email" autoFocus disabled={loading} />
          <PrimaryButton type="submit" disabled={loading}>{loading ? "Sending…" : "Send link"}</PrimaryButton>
        </form>
      </AnimateStep>
    </Shell>
  );
}

export function ResetSentStep({ email, goTo }: Pick<AuthFunnelState, "email"> & Pick<AuthFunnelActions, "goTo">) {
  return (
    <Shell>
      <AnimateStep stepKey="reset-sent">
        <CheckCircleIcon className="text-accent" />
        <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
        <p className="max-w-[320px] text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          We sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Check your inbox and follow the link.
        </p>
        <PrimaryButton onClick={() => goTo("email-login")}>Back to log in</PrimaryButton>
      </AnimateStep>
    </Shell>
  );
}

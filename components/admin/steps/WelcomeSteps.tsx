"use client";

import { Shell, AnimateStep, MethodButton, BackButton, TextLink, Footer, MailIcon, PhoneIcon } from "@/components/admin/ui";
import type { AuthFunnelActions } from "@/types/admin/authFunnel";

export function WelcomeStep({ goTo, setMode }: Pick<AuthFunnelActions, "goTo" | "setMode">) {
  return (
    <Shell>
      <AnimateStep stepKey="welcome">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
          <span className="text-3xl font-bold text-white">D</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Dorm AI</h1>
        <p className="max-w-[320px] text-center text-base leading-relaxed text-secondary-alt dark:text-zinc-400">
          Streamline inspections, catch damages early, and manage your properties — all in one place.
        </p>
        <div className="flex w-full flex-col gap-3 pt-2">
          <MethodButton icon={<MailIcon className="text-secondary" />} label="Sign up with email" onClick={() => { setMode("signup"); goTo("email-signup"); }} />
          <MethodButton icon={<PhoneIcon className="text-secondary" />} label="Sign up with phone" onClick={() => { setMode("signup"); goTo("phone-entry"); }} />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <TextLink onClick={() => { setMode("login"); goTo("login-chooser"); }}>Log in</TextLink>
        </p>
        <Footer />
      </AnimateStep>
    </Shell>
  );
}

export function LoginChooserStep({ goTo, setMode, goWelcome }: Pick<AuthFunnelActions, "goTo" | "setMode" | "goWelcome">) {
  return (
    <Shell>
      <AnimateStep stepKey="login-chooser">
        <BackButton onClick={goWelcome} />
        <h1 className="self-start text-3xl font-bold tracking-tight">Welcome back</h1>
        <div className="flex w-full flex-col gap-3 pt-1">
          <MethodButton icon={<MailIcon className="text-secondary" />} label="Continue with email" onClick={() => goTo("email-login")} />
          <MethodButton icon={<PhoneIcon className="text-secondary" />} label="Continue with phone" onClick={() => goTo("phone-entry")} />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <TextLink onClick={() => { setMode("signup"); goWelcome(); }}>Create account</TextLink>
        </p>
      </AnimateStep>
    </Shell>
  );
}

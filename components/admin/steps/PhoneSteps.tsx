"use client";

import type { FormEvent, RefObject } from "react";
import { Shell, AnimateStep, BackButton, AuthInput, PrimaryButton } from "@/components/admin/ui";
import { formatPhoneDisplay } from "@/lib/admin/phoneFormat";
import type { AuthStep } from "@/types/admin/authFunnel";

/** Phone flow is optional; steps are not part of the active email-only `AuthStep` union until wired in the funnel. */
type PhoneAuthStep = AuthStep | "phone-entry" | "phone-otp";

type PhoneEntryProps = {
  phone: string;
  loading: boolean;
  mode: "signup" | "login";
  setPhone: (v: string) => void;
  goTo: (step: PhoneAuthStep) => void;
  handleSendPhoneCode: (e: FormEvent) => void | Promise<void>;
  recaptchaContainerRef: RefObject<HTMLDivElement | null>;
};

export function PhoneEntryStep({ phone, loading, mode, setPhone, goTo, handleSendPhoneCode, recaptchaContainerRef }: PhoneEntryProps) {
  return (
    <Shell>
      <AnimateStep stepKey="phone-entry">
        <BackButton onClick={() => goTo(mode === "login" ? "login-chooser" : "welcome")} />
        <h1 className="self-start text-3xl font-bold tracking-tight">Continue with phone:</h1>
        <p className="self-start text-sm text-zinc-500 dark:text-zinc-400">We&apos;ll text a verification code to your number.</p>
        <form onSubmit={handleSendPhoneCode} className="flex w-full flex-col gap-5">
          <AuthInput id="phone-number" type="tel" placeholder="+1 (555) 000-0000" value={formatPhoneDisplay(phone)} onChange={setPhone} autoComplete="tel" autoFocus disabled={loading} />
          <PrimaryButton type="submit" disabled={loading}>{loading ? "Sending code…" : "Send code"}</PrimaryButton>
        </form>
        <div ref={recaptchaContainerRef} />
      </AnimateStep>
    </Shell>
  );
}

type PhoneOtpProps = {
  phone: string;
  otp: string;
  loading: boolean;
  resendCooldown: number;
  setOtp: (v: string) => void;
  goTo: (step: PhoneAuthStep) => void;
  handleVerifyOtp: (e: FormEvent) => void | Promise<void>;
  handleResendCode: () => void | Promise<void>;
  recaptchaContainerRef: RefObject<HTMLDivElement | null>;
};

export function PhoneOtpStep({ phone, otp, loading, resendCooldown, setOtp, goTo, handleVerifyOtp, handleResendCode, recaptchaContainerRef }: PhoneOtpProps) {
  return (
    <Shell>
      <AnimateStep stepKey="phone-otp">
        <BackButton onClick={() => goTo("phone-entry")} />
        <h1 className="self-start text-3xl font-bold tracking-tight">Enter verification code</h1>
        <p className="self-start text-sm text-zinc-500 dark:text-zinc-400">
          We sent a 6-digit code to <span className="font-medium text-foreground">{formatPhoneDisplay(phone)}</span>
        </p>
        <form onSubmit={handleVerifyOtp} className="flex w-full flex-col gap-5">
          <AuthInput id="otp-code" type="text" placeholder="000000" value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))} autoComplete="one-time-code" autoFocus disabled={loading} />
          <PrimaryButton type="submit" disabled={loading || otp.length < 6}>{loading ? "Verifying…" : "Verify"}</PrimaryButton>
        </form>
        <button type="button" onClick={handleResendCode} disabled={resendCooldown > 0 || loading} className="text-sm font-medium text-accent transition-opacity disabled:opacity-40">
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
        </button>
        <div ref={recaptchaContainerRef} />
      </AnimateStep>
    </Shell>
  );
}

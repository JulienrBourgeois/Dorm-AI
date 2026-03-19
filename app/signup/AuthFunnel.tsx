"use client";

import { useAuthFunnel } from "@/hooks/auth/useAuthFunnel";
import { WelcomeStep, LoginChooserStep } from "@/components/auth/steps/WelcomeSteps";
import { EmailSignUpStep, EmailLoginStep } from "@/components/auth/steps/EmailSteps";
import { PhoneEntryStep, PhoneOtpStep } from "@/components/auth/steps/PhoneSteps";
import { ForgotPasswordStep, ResetSentStep } from "@/components/auth/steps/ResetSteps";
import { LoadingStep } from "@/components/auth/steps/StatusSteps";

export function AuthFunnel() {
  const f = useAuthFunnel();

  switch (f.step) {
    case "welcome":
      return <WelcomeStep goTo={f.goTo} setMode={f.setMode} />;

    case "login-chooser":
      return <LoginChooserStep goTo={f.goTo} setMode={f.setMode} goWelcome={f.goWelcome} />;

    case "email-signup":
      return (
        <EmailSignUpStep
          email={f.email} password={f.password} confirmPassword={f.confirmPassword}
          loading={f.loading}
          setEmail={f.setEmail} setPassword={f.setPassword} setConfirmPassword={f.setConfirmPassword}
          goTo={f.goTo} goWelcome={f.goWelcome}
          handleEmailSignUp={f.handleEmailSignUp} handleEmailSignIn={f.handleEmailSignIn}
        />
      );

    case "email-login":
      return (
        <EmailLoginStep
          email={f.email} password={f.password} confirmPassword={f.confirmPassword}
          loading={f.loading}
          setEmail={f.setEmail} setPassword={f.setPassword} setConfirmPassword={f.setConfirmPassword}
          goTo={f.goTo} goWelcome={f.goWelcome}
          handleEmailSignUp={f.handleEmailSignUp} handleEmailSignIn={f.handleEmailSignIn}
        />
      );

    case "phone-entry":
      return (
        <PhoneEntryStep
          phone={f.phone} loading={f.loading} mode={f.mode}
          setPhone={f.setPhone} goTo={f.goTo} handleSendPhoneCode={f.handleSendPhoneCode}
          recaptchaContainerRef={f.recaptchaContainerRef}
        />
      );

    case "phone-otp":
      return (
        <PhoneOtpStep
          phone={f.phone} otp={f.otp} loading={f.loading}
          resendCooldown={f.resendCooldown}
          setOtp={f.setOtp} goTo={f.goTo}
          handleVerifyOtp={f.handleVerifyOtp} handleResendCode={f.handleResendCode}
          recaptchaContainerRef={f.recaptchaContainerRef}
        />
      );

    case "forgot-password":
      return (
        <ForgotPasswordStep
          email={f.email} loading={f.loading}
          setEmail={f.setEmail} goTo={f.goTo} handleForgotPassword={f.handleForgotPassword}
        />
      );

    case "reset-sent":
      return <ResetSentStep email={f.email} goTo={f.goTo} />;

    case "checking-access":
      return <LoadingStep message={f.checkingMessage} />;

    default:
      return null;
  }
}

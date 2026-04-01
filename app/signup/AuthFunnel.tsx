"use client";

import { useAuthFunnel } from "@/hooks/auth/useAuthFunnel";
import { WelcomeStep, LoginChooserStep } from "@/components/auth/steps/WelcomeSteps";
import { EmailSignUpStep, EmailLoginStep } from "@/components/auth/steps/EmailSteps";
import { ForgotPasswordStep, ResetSentStep } from "@/components/auth/steps/ResetSteps";

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
          loading={f.loading} joinInviteReturn={f.joinInviteReturn}
          setEmail={f.setEmail} setPassword={f.setPassword} setConfirmPassword={f.setConfirmPassword}
          goTo={f.goTo} goWelcome={f.goWelcome}
          handleEmailSignUp={f.handleEmailSignUp} handleEmailSignIn={f.handleEmailSignIn}
        />
      );

    case "email-login":
      return (
        <EmailLoginStep
          email={f.email} password={f.password} confirmPassword={f.confirmPassword}
          loading={f.loading} joinInviteReturn={f.joinInviteReturn}
          setEmail={f.setEmail} setPassword={f.setPassword} setConfirmPassword={f.setConfirmPassword}
          goTo={f.goTo} goWelcome={f.goWelcome}
          handleEmailSignUp={f.handleEmailSignUp} handleEmailSignIn={f.handleEmailSignIn}
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

    default:
      return null;
  }
}

"use client";

import { useAuthFunnel } from "@/hooks/admin/useAuthFunnel";
import { WelcomeStep, LoginChooserStep } from "@/components/admin/steps/WelcomeSteps";
import { EmailSignUpStep, EmailLoginStep } from "@/components/admin/steps/EmailSteps";
import { ForgotPasswordStep, ResetSentStep } from "@/components/admin/steps/ResetSteps";
import { CheckingAccessStep, AccessDeniedStep } from "@/components/admin/steps/StatusSteps";

export function AdminAuthFunnel() {
  const f = useAuthFunnel();

  switch (f.step) {
    case "welcome":
      return <WelcomeStep goTo={f.goTo} setMode={f.setMode} />;

    case "login-chooser":
      return <LoginChooserStep goTo={f.goTo} setMode={f.setMode} goWelcome={f.goWelcome} />;

    case "email-signup":
      return (
        <EmailSignUpStep
          email={f.email}
          password={f.password}
          confirmPassword={f.confirmPassword}
          loading={f.loading}
          setEmail={f.setEmail}
          setPassword={f.setPassword}
          setConfirmPassword={f.setConfirmPassword}
          goWelcome={f.goWelcome}
          goTo={f.goTo}
          handleEmailSignUp={f.handleEmailSignUp}
          handleEmailSignIn={f.handleEmailSignIn}
        />
      );

    case "email-login":
      return (
        <EmailLoginStep
          email={f.email}
          password={f.password}
          confirmPassword={f.confirmPassword}
          loading={f.loading}
          setEmail={f.setEmail}
          setPassword={f.setPassword}
          setConfirmPassword={f.setConfirmPassword}
          goWelcome={f.goWelcome}
          goTo={f.goTo}
          handleEmailSignUp={f.handleEmailSignUp}
          handleEmailSignIn={f.handleEmailSignIn}
        />
      );

    case "forgot-password":
      return (
        <ForgotPasswordStep
          email={f.email}
          loading={f.loading}
          setEmail={f.setEmail}
          goTo={f.goTo}
          handleForgotPassword={f.handleForgotPassword}
        />
      );

    case "reset-sent":
      return <ResetSentStep email={f.email} goTo={f.goTo} />;

    case "checking-access":
      return <CheckingAccessStep message={f.checkingMessage} />;

    case "access-denied":
      return <AccessDeniedStep handleSignOutAndReset={f.handleSignOutAndReset} />;

    default:
      return null;
  }
}


import type { FormEvent, RefObject } from "react";

export type AuthStep =
  | "welcome"
  | "login-chooser"
  | "email-signup"
  | "email-login"
  | "phone-entry"
  | "phone-otp"
  | "forgot-password"
  | "reset-sent"
  | "checking-access"
  | "access-denied";

export interface AuthFunnelState {
  step: AuthStep;
  mode: "signup" | "login";
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  otp: string;
  loading: boolean;
  resendCooldown: number;
  checkingMessage: string;
  recaptchaContainerRef: RefObject<HTMLDivElement | null>;
}

export interface AuthFunnelActions {
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setPhone: (v: string) => void;
  setOtp: (v: string) => void;
  setMode: (m: "signup" | "login") => void;
  goTo: (step: AuthStep) => void;
  goWelcome: () => void;
  handleEmailSignUp: (e: FormEvent) => void;
  handleEmailSignIn: (e: FormEvent) => void;
  handleSendPhoneCode: (e: FormEvent) => void;
  handleVerifyOtp: (e: FormEvent) => void;
  handleResendCode: () => void;
  handleForgotPassword: (e: FormEvent) => void;
  handleSignOutAndReset: () => void;
}

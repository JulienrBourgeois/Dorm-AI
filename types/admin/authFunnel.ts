import type { FormEvent } from "react";

export type AuthStep =
  | "welcome"
  | "login-chooser"
  | "email-signup"
  | "email-login"
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
  loading: boolean;
  checkingMessage: string;
}

export interface AuthFunnelActions {
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setMode: (m: "signup" | "login") => void;
  goTo: (step: AuthStep) => void;
  goWelcome: () => void;
  handleEmailSignUp: (e: FormEvent) => void;
  handleEmailSignIn: (e: FormEvent) => void;
  handleForgotPassword: (e: FormEvent) => void;
  handleSignOutAndReset: () => void;
}

"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { ConfirmationResult } from "firebase/auth";
import {
  signIn,
  signUp,
  signOutUser,
  createRecaptchaVerifier,
  sendPhoneCode,
  confirmPhoneCode,
  sendPasswordReset,
  subscribeToAuthState,
} from "@/app/lib/firebase/auth";
import { upsertUserDoc } from "@/lib/auth/userBootstrap";
import { getAuthErrorMessage } from "@/lib/auth/authErrors";
import { phoneToE164 } from "@/lib/auth/phoneFormat";
import type { AuthStep, AuthFunnelState, AuthFunnelActions } from "@/types/auth/authFunnel";

const STEP_FROM_URL: AuthStep[] = [
  "welcome",
  "login-chooser",
  "email-signup",
  "email-login",
  "phone-entry",
  "phone-otp",
  "forgot-password",
  "reset-sent",
  "checking-access",
];

function stepFromParam(param: string | null): AuthStep | null {
  if (!param || !STEP_FROM_URL.includes(param as AuthStep)) return null;
  return param as AuthStep;
}

export function useAuthFunnel(): AuthFunnelState & AuthFunnelActions {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Optional post-login destination (used by role portals like inspector).
  // Only allow local paths to avoid open redirects.
  const redirectToParam = searchParams.get("next") ?? searchParams.get("redirect");
  const redirectTo =
    redirectToParam && redirectToParam.startsWith("/") ? redirectToParam : null;

  const stepParam = searchParams.get("step");
  const emailParam = searchParams.get("email") ?? "";

  const [step, setStep] = useState<AuthStep>(() => stepFromParam(stepParam) ?? "welcome");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState(() => (stepParam === "forgot-password" || stepParam === "email-login" ? emailParam : ""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const setPhone = useCallback((value: string) => {
    setPhoneDigits(value.replace(/\D/g, "").slice(0, 11));
  }, []);
  const phone = phoneDigits;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingMessage, setCheckingMessage] = useState("Setting up your account…");

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaInitialized = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (user && step === "welcome") {
        await postAuth(user);
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    const urlStep = stepFromParam(searchParams.get("step"));
    if (urlStep !== null && urlStep !== step) setStep(urlStep);
    const urlEmail = searchParams.get("email");
    if (urlEmail != null && urlEmail !== email) setEmail(urlEmail);
  }, [searchParams]);

  const postAuth = useCallback(
    async (user: import("firebase/auth").User) => {
      try {
        const { created } = await upsertUserDoc(user);
        setCheckingMessage(created ? "Creating your account…" : "Signing you in…");
        setStep("checking-access");
        router.push(redirectTo ?? "/home");
      } catch (err) {
        toast.error(getAuthErrorMessage(err));
      }
    },
    [router, redirectTo]
  );

  function goTo(next: AuthStep) {
    setStep(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", next);
    if ((next === "forgot-password" || next === "email-login" || next === "email-signup") && email.trim()) {
      params.set("email", email.trim());
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function goWelcome() {
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setStep("welcome");
    router.replace(pathname, { scroll: false });
  }

  async function handleEmailSignUp(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      const { user } = await signUp(email, password);
      await postAuth(user);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email.");
    if (!password) return toast.error("Please enter your password.");
    setLoading(true);
    try {
      const { user } = await signIn(email, password);
      await postAuth(user);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPhoneCode(e: FormEvent) {
    e.preventDefault();
    if (phone.length < 10) return toast.error("Please enter a valid US phone number (10 digits).");
    const e164 = phoneToE164(phone);
    setLoading(true);
    try {
      if (!recaptchaInitialized.current && recaptchaContainerRef.current) {
        createRecaptchaVerifier(recaptchaContainerRef.current, { size: "invisible" });
        recaptchaInitialized.current = true;
      }
      const confirmation = await sendPhoneCode(e164);
      confirmationRef.current = confirmation;
      setResendCooldown(60);
      goTo("phone-otp");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Please enter the 6-digit code.");
    if (!confirmationRef.current) return toast.error("Session expired. Please request a new code.");
    setLoading(true);
    try {
      const { user } = await confirmPhoneCode(confirmationRef.current, otp);
      await postAuth(user);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      recaptchaInitialized.current = false;
      if (recaptchaContainerRef.current) {
        createRecaptchaVerifier(recaptchaContainerRef.current, { size: "invisible" });
        recaptchaInitialized.current = true;
      }
      const confirmation = await sendPhoneCode(phoneToE164(phone));
      confirmationRef.current = confirmation;
      setResendCooldown(60);
      setOtp("");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email.");
    setLoading(true);
    try {
      await sendPasswordReset(email);
      goTo("reset-sent");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOutAndReset() {
    await signOutUser();
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setOtp("");
    goWelcome();
  }

  return {
    step, mode, email, password, confirmPassword, phone, otp,
    loading, resendCooldown, checkingMessage, recaptchaContainerRef,
    setEmail, setPassword, setConfirmPassword, setPhone, setOtp, setMode,
    goTo, goWelcome,
    handleEmailSignUp, handleEmailSignIn,
    handleSendPhoneCode, handleVerifyOtp, handleResendCode,
    handleForgotPassword, handleSignOutAndReset,
  };
}

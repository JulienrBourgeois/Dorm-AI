"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  signIn,
  signUp,
  signOutUser,
  sendPasswordReset,
  subscribeToAuthState,
} from "@/app/lib/firebase/auth";
import {
  upsertUserDoc,
  checkAdminAccess,
  setSessionCookie,
  clearSessionCookie,
  getAuthErrorMessage,
} from "@/lib/admin/adminAuth";
import { isUserExistsByEmail } from "@/lib/auth/userByEmail";
import type { AuthStep, AuthFunnelState, AuthFunnelActions } from "@/types/admin/authFunnel";

const STEP_FROM_URL: AuthStep[] = [
  "welcome",
  "login-chooser",
  "email-signup",
  "email-login",
  "forgot-password",
  "reset-sent",
  "checking-access",
  "access-denied",
];

function stepFromParam(param: string | null): AuthStep | null {
  if (!param || !STEP_FROM_URL.includes(param as AuthStep)) return null;
  return param as AuthStep;
}

export function useAuthFunnel(): AuthFunnelState & AuthFunnelActions {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const stepParam = searchParams.get("step");
  const emailParam = searchParams.get("email") ?? "";

  const [step, setStep] = useState<AuthStep>(() => stepFromParam(stepParam) ?? "welcome");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState(() => (stepParam === "forgot-password" || stepParam === "email-login" ? emailParam : ""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingMessage, setCheckingMessage] = useState("Verifying access…");

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (user && step === "welcome") {
        await postAuth(user);
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync step from URL when user uses back/forward or lands with ?step=
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
        setCheckingMessage(created ? "Creating your account…" : "Verifying access…");
        setStep("checking-access");
        const isAdmin = await checkAdminAccess(user.uid);
        if (isAdmin) {
          const token = await user.getIdToken();
          await setSessionCookie(token);
          router.push("/home/dashboard");
        } else {
          setStep("access-denied");
        }
      } catch (err) {
        toast.error(getAuthErrorMessage(err));
        setStep("access-denied");
      }
    },
    [router]
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

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email.");
    setLoading(true);
    try {
      const exists = await isUserExistsByEmail(email);
      if (!exists) {
        toast.error("No account found with this email.");
        setLoading(false);
        return;
      }
      await sendPasswordReset(email);
      goTo("reset-sent");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOutAndReset() {
    await clearSessionCookie();
    await signOutUser();
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    goWelcome();
  }

  return {
    step, mode, email, password, confirmPassword,
    loading, checkingMessage,
    setEmail, setPassword, setConfirmPassword, setMode,
    goTo, goWelcome,
    handleEmailSignUp, handleEmailSignIn,
    handleForgotPassword, handleSignOutAndReset,
  };
}

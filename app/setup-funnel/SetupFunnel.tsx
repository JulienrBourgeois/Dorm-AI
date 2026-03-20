"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Shell,
  AnimateStep,
  AuthInput,
  PrimaryButton,
  Footer,
} from "@/components/auth/ui";
import { Loader } from "@/components/Loader";
import { auth } from "@/app/lib/firebase/app";
import { subscribeToAuthState } from "@/app/lib/firebase/auth/state";
import {
  getDocumentData,
  updateDocument,
  COLLECTIONS,
  dateToTimestamp,
} from "@/app/lib/firebase/firestore";
import type { UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "property_manager", label: "Property manager" },
  { value: "inspector", label: "Inspector" },
  { value: "tenant", label: "Tenant" },
];

interface UserDocData {
  name?: string;
  email?: string;
  dateOfBirth?: string;
  role?: UserRole;
}

function portalPathForRole(role: UserRole): "/admin/dashboard" | "/inspector" | "/tenant" {
  if (role === "inspector") return "/inspector";
  if (role === "tenant") return "/tenant";
  return "/admin/dashboard";
}

export function SetupFunnel() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "submitting">("loading");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        router.replace("/signup");
        return;
      }
      const { data } = await getDocumentData<UserDocData>(COLLECTIONS.users, user.uid);
      if (data?.dateOfBirth) {
        const path = data.role ? portalPathForRole(data.role) : "/admin/dashboard";
        router.replace(path);
        return;
      }
      setName(data?.name ?? user.displayName ?? "");
      setDateOfBirth(data?.dateOfBirth ?? "");
      setEmail(user.email ?? data?.email ?? "");
      setStatus("ready");
    });
    return unsubscribe;
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const user = auth.currentUser;
    if (!user) {
      toast.error("Session expired. Please sign in again.");
      router.replace("/signup");
      setStatus("ready");
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter your name.");
      setStatus("ready");
      return;
    }
    const dobTrimmed = dateOfBirth.trim();
    if (!dobTrimmed) {
      toast.error("Please enter your date of birth.");
      setStatus("ready");
      return;
    }
    const dobMatch = /^\d{4}-\d{2}-\d{2}$/.exec(dobTrimmed);
    if (!dobMatch) {
      toast.error("Please enter a valid date (YYYY-MM-DD).");
      setStatus("ready");
      return;
    }
    if (!role) {
      toast.error("Please select who you are.");
      setStatus("ready");
      return;
    }
    try {
      const payload: Record<string, unknown> = {
        name: trimmedName,
        dateOfBirth: dobTrimmed,
        email: email.trim(),
        role,
        updatedAt: dateToTimestamp(new Date()),
      };
      await updateDocument(COLLECTIONS.users, user.uid, payload as Parameters<typeof updateDocument>[2]);
      router.push(portalPathForRole(role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("ready");
    }
  }

  if (status === "loading") {
    return <Loader fullPage className="bg-white dark:bg-black" />;
  }

  return (
    <Shell>
      <AnimateStep stepKey="setup-funnel">
        <h1 className="self-start text-3xl font-bold tracking-tight md:text-4xl">
          Finish setting up
        </h1>
        <p className="self-start text-sm text-zinc-500 dark:text-zinc-400">
          A few quick questions so we can personalize your experience.
        </p>
        <form
          onSubmit={handleSubmit}
          className={`flex w-full flex-col gap-5 ${status === "submitting" ? "pointer-events-none" : ""}`}
          aria-busy={status === "submitting"}
        >
          <div className="w-full">
            <label htmlFor="setup-name" className="sr-only">
              Your name
            </label>
            <AuthInput
              id="setup-name"
              type="text"
              placeholder="What is your name?"
              value={name}
              onChange={setName}
              autoComplete="name"
              disabled={status === "submitting"}
            />
          </div>
          <div className="w-full">
            <label htmlFor="setup-dateOfBirth" className="mb-1 block text-sm text-zinc-500 dark:text-zinc-400">
              What is your date of birth?
            </label>
            <input
              id="setup-dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={status === "submitting"}
              className="h-12 w-full border-b-2 border-zinc-200 bg-transparent text-base text-foreground outline-none transition-all duration-200 focus:border-accent disabled:opacity-40 md:h-13 md:text-[17px] dark:border-zinc-700 dark:focus:border-accent"
            />
          </div>
          <div className="w-full">
            <label htmlFor="setup-email" className="sr-only">
              Email
            </label>
            <AuthInput
              id="setup-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              disabled={status === "submitting"}
            />
          </div>
          <div className="w-full">
            <p className="mb-3 self-start text-sm font-medium text-foreground">
              Who are you?
            </p>
            <div className="flex flex-col gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  disabled={status === "submitting"}
                  className={`flex h-12 w-full items-center justify-center rounded-2xl border-2 text-[15px] font-medium transition-all disabled:opacity-40 md:h-[52px] md:text-base ${
                    role === opt.value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-zinc-200 bg-white text-foreground hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <PrimaryButton type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Saving…" : "Continue"}
          </PrimaryButton>
        </form>
        <Footer />
      </AnimateStep>
    </Shell>
  );
}

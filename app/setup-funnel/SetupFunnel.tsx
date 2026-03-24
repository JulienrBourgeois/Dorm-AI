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
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { Loader } from "@/components/Loader";
import { auth } from "@/app/lib/firebase/app";
import { subscribeToAuthState } from "@/app/lib/firebase/auth/state";
import { signOutUser } from "@/app/lib/firebase/auth";
import { clearSessionCookie } from "@/lib/admin/adminAuth";
import {
  getDocumentData,
  updateDocument,
  COLLECTIONS,
  dateToTimestamp,
} from "@/app/lib/firebase/firestore";
import {
  e164ToUsPhoneInput,
  formatUsPhoneInput,
  isValidNanp10,
  usDigitsToE164,
  usPhoneDigitsFromInput,
} from "@/lib/phoneUs";

interface UserDocData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export function SetupFunnel() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "submitting">("loading");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        router.replace("/signup");
        return;
      }
      const { data } = await getDocumentData<UserDocData>(COLLECTIONS.users, user.uid);
      if (data?.dateOfBirth) {
        router.replace("/home/dashboard");
        return;
      }
      setName(data?.name ?? user.displayName ?? "");
      setDateOfBirth(data?.dateOfBirth ?? "");
      setPhone(data?.phone ? e164ToUsPhoneInput(data.phone) : "");
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
    const phoneDigits = usPhoneDigitsFromInput(phone);
    if (!isValidNanp10(phoneDigits)) {
      toast.error("Enter a valid US phone number (10 digits).");
      setStatus("ready");
      return;
    }
    const phoneE164 = usDigitsToE164(phoneDigits);
    if (!phoneE164) {
      toast.error("Enter a valid US phone number (10 digits).");
      setStatus("ready");
      return;
    }
    try {
      await updateDocument(COLLECTIONS.users, user.uid, {
        id: user.uid,
        name: trimmedName,
        dateOfBirth: dobTrimmed,
        phone: phoneE164,
        email: user.email ?? "",
        updatedAt: dateToTimestamp(new Date()),
      } as Parameters<typeof updateDocument>[2]);
      router.push("/home/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("ready");
    }
  }

  async function handleSignOut() {
    try {
      await clearSessionCookie();
      await signOutUser();
      router.push("/");
    } catch {
      toast.error("Could not sign out. Try again.");
    }
  }

  if (status === "loading") {
    return <Loader fullPage />;
  }

  return (
    <Shell
      headerEnd={
        <AccountDrawer
          displayName={name.trim() || undefined}
          email={auth.currentUser?.email ?? undefined}
          shortcuts={[
            { href: "/", label: "About Inspect AI" },
            { href: "/settings", label: "Settings" },
          ]}
          onSignOut={handleSignOut}
        />
      }
    >
      <AnimateStep stepKey="setup-funnel">
        <h1 className="self-start text-3xl font-bold tracking-tight md:text-4xl">
          Finish setting up
        </h1>
        <p className="self-start text-sm text-zinc-500 dark:text-zinc-400">
          A few quick details so we know who you are. You&apos;ll choose how to use Inspect AI next.
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
            <label htmlFor="setup-phone" className="mb-1 block text-sm text-zinc-500 dark:text-zinc-400">
              Mobile number
            </label>
            <AuthInput
              id="setup-phone"
              type="tel"
              inputMode="tel"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(v) => setPhone(formatUsPhoneInput(v))}
              autoComplete="tel-national"
              disabled={status === "submitting"}
            />
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

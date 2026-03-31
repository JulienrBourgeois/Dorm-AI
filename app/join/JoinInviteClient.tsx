"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";

export function JoinInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = useMemo(
    () => searchParams.get("code")?.trim().toUpperCase() ?? "",
    [searchParams],
  );
  const [message, setMessage] = useState("Preparing invite join...");
  const [failed, setFailed] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setSignedInEmail(user?.email?.trim() ?? null);
      if (!code) {
        setFailed(true);
        setMessage("Invite code is missing. Ask your property team for a full invite link.");
        return;
      }
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(`/join?code=${code}`)}`);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/auth/join-invite", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });
        const payload = (await response.json()) as
          | { data?: { role?: string } }
          | { error?: { message?: string } };
        if (!response.ok) {
          const msg =
            "error" in payload ? payload.error?.message : undefined;
          throw new Error(msg || "Invite code is invalid or expired.");
        }
        const role = "data" in payload ? payload.data?.role : undefined;
        setMessage("Invite accepted. Redirecting…");
        router.replace(role === "INSPECTOR" ? "/inspector" : "/tenant");
      } catch (err) {
        setFailed(true);
        setMessage(
          err instanceof Error ? err.message : "Failed to process invite.",
        );
      }
    });

    return unsubscribe;
  }, [code, router]);

  const emailMismatch =
    failed &&
    message.toLowerCase().includes("different email") &&
    Boolean(signedInEmail);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-20">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Join by invite
          </h1>
          {!failed ? (
            <div className="mt-4 flex items-center gap-3">
              <div
                className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-zinc-200 border-t-accent dark:border-zinc-700 dark:border-t-accent"
                role="status"
                aria-label="Loading"
              />
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
          )}
          {emailMismatch ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              You&apos;re signed in as <span className="font-mono text-zinc-800 dark:text-zinc-200">{signedInEmail}</span>.
              Sign out and use the email address your property team put on the invite, or ask them to send a new invite to
              your current email.
            </p>
          ) : null}
          {failed ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/login"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Log in
              </Link>
              <Link
                href="/home/dashboard"
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                Open dashboard
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

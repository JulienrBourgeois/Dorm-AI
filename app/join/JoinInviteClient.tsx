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

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!code) {
        setFailed(true);
        setMessage("Invite code is missing.");
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
        setMessage("Invite accepted. Redirecting...");
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-20">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Join by invite
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            {message}
          </p>
          {failed ? (
            <div className="mt-4 flex gap-2">
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

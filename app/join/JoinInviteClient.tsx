"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOutUser, subscribeToAuthState } from "@/app/lib/firebase/auth";
import { clearSessionCookie } from "@/lib/admin/adminAuth";

function buildJoinPath(code: string, invitedEmail: string): string {
  const e = invitedEmail.trim().toLowerCase();
  const q = new URLSearchParams({ code });
  if (e) q.set("e", e);
  return `/join?${q.toString()}`;
}

function buildSignupReturnUrl(code: string, invitedEmail: string): string {
  const joinPath = buildJoinPath(code, invitedEmail);
  const em = invitedEmail.trim().toLowerCase();
  const qs = new URLSearchParams();
  qs.set("step", "email-login");
  qs.set("next", joinPath);
  if (em) qs.set("email", em);
  return `/signup?${qs.toString()}`;
}

export function JoinInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = useMemo(
    () => searchParams.get("code")?.trim().toUpperCase() ?? "",
    [searchParams],
  );
  const invitedEmail = useMemo(
    () => searchParams.get("e")?.trim().toLowerCase() ?? "",
    [searchParams],
  );

  const [message, setMessage] = useState("Opening your invite…");
  const [failed, setFailed] = useState(false);
  const attemptRef = useRef(false);
  const unauthRedirectRef = useRef(false);

  useEffect(() => {
    if (!code) {
      setFailed(true);
      setMessage("This invite link is missing a code. Ask your property manager for a new link.");
      return;
    }

    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        if (unauthRedirectRef.current) return;
        unauthRedirectRef.current = true;
        setMessage("Sign in with the email that received this invite. We’ll bring you right back.");
        router.replace(buildSignupReturnUrl(code, invitedEmail));
        return;
      }

      if (attemptRef.current) return;
      attemptRef.current = true;
      setMessage("Confirming your invite…");

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
          | { error?: { code?: string; message?: string } };

        if (!response.ok) {
          const errCode = "error" in payload ? payload.error?.code : undefined;
          const msg =
            "error" in payload ? payload.error?.message : "Invite could not be used.";

          const wrongEmail =
            response.status === 403 ||
            errCode === "FORBIDDEN" ||
            (msg && msg.toLowerCase().includes("different email"));

          if (wrongEmail) {
            attemptRef.current = false;
            try {
              await clearSessionCookie();
            } catch {
              /* ignore */
            }
            await signOutUser();
            unauthRedirectRef.current = true;
            setMessage(
              invitedEmail
                ? `Sign in or create an account as ${invitedEmail} to accept this invite.`
                : "Sign in with the email that received this invite.",
            );
            router.replace(buildSignupReturnUrl(code, invitedEmail));
            return;
          }

          throw new Error(msg || "Invite code is invalid or expired.");
        }

        const role = "data" in payload ? payload.data?.role : undefined;
        setMessage("You’re in. Redirecting…");
        router.replace(role === "INSPECTOR" ? "/inspector" : "/tenant");
      } catch (err) {
        attemptRef.current = false;
        setFailed(true);
        setMessage(
          err instanceof Error ? err.message : "Something went wrong. Try again in a moment.",
        );
      }
    });

    return unsubscribe;
  }, [code, invitedEmail, router]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-20">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Invitation
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
          {failed ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={code ? buildSignupReturnUrl(code, invitedEmail) : "/signup?step=email-login"}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Try signing in again
              </Link>
              <Link
                href="/home/dashboard"
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                Home
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

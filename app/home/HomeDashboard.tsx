"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase/app";
import { signOutUser, subscribeToAuthState } from "@/app/lib/firebase/auth";
import { clearSessionCookie } from "@/lib/admin/adminAuth";
import {
  getDocumentData,
  queryCollection,
  COLLECTIONS,
} from "@/app/lib/firebase/firestore";
import { where } from "firebase/firestore";
import type { Organization } from "@/types/dorm";
import type { WithId } from "@/types";
import { formatOrganizationCardSubtitle } from "@/lib/organizationDisplay";
import { Loader } from "@/components/Loader";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { AppBrandReload } from "@/components/AppBrandReload";

interface UserDocData {
  name?: string;
  dateOfBirth?: string;
}

interface MembershipDoc {
  userId: string;
  organizationId: string;
  role: string;
  status: string;
}

type OrgAccess = WithId<Organization> & { membershipRole: string };

export function HomeDashboard() {
  const router = useRouter();
  const [guardReady, setGuardReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [orgAccess, setOrgAccess] = useState<OrgAccess[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        router.replace("/signup");
        return;
      }
      const { data: userData } = await getDocumentData<UserDocData>(
        COLLECTIONS.users,
        user.uid
      );
      if (!userData?.dateOfBirth) {
        router.replace("/setup-funnel");
        return;
      }
      setUserName(userData.name ?? "there");
      setUserEmail(user.email ?? "");

      const snapshot = await queryCollection(
        COLLECTIONS.memberships,
        where("userId", "==", user.uid),
        where("status", "==", "ACTIVE"),
      );
      const list: OrgAccess[] = [];
      for (const d of snapshot.docs) {
        const m = d.data() as MembershipDoc;
        const { data: org } = await getDocumentData<Organization>(
          COLLECTIONS.organizations,
          m.organizationId
        );
        if (org) {
          list.push({
            ...org,
            id: m.organizationId,
            membershipRole: m.role,
          });
        }
      }
      setOrgAccess(list);
      setGuardReady(true);
    });
    return unsubscribe;
  }, [router]);

  async function handleJoinWithCode(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoinError(null);
    setJoinLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You need to be signed in to use an invite code.");
      }
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
        | { data?: { organizationId?: string; role?: string } }
        | { error?: { message?: string } };
      if (!response.ok) {
        const message =
          "error" in payload ? payload.error?.message : undefined;
        throw new Error(message || "Invalid or expired code.");
      }
      const organizationId =
        "data" in payload ? payload.data?.organizationId : undefined;
      const invitedRole = "data" in payload ? payload.data?.role : undefined;
      if (!organizationId) {
        throw new Error("Invite joined but organization was not returned.");
      }
      const { data: org } = await getDocumentData<Organization>(
        COLLECTIONS.organizations,
        organizationId
      );
      if (org) {
        setOrgAccess((prev) => [
          ...prev.filter((o) => o.id !== organizationId),
          {
            ...org,
            id: organizationId,
            membershipRole: invitedRole ?? "TENANT",
          },
        ]);
      }
      setJoinCode("");
      if (invitedRole === "INSPECTOR") {
        router.push("/inspector");
      } else if (invitedRole === "TENANT") {
        router.push("/tenant");
      }
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await clearSessionCookie();
      await signOutUser();
      router.push("/");
    } catch {
      /* still navigate away */
      router.push("/");
    }
  }

  if (!guardReady) {
    return <Loader fullPage className="bg-white dark:bg-black" />;
  }

  const firstName = userName.split(/\s+/)[0] || userName;

  function hrefForAccess(entry: OrgAccess): string {
    if (entry.membershipRole === "ADMIN") {
      return `/admin/dashboard?organizationId=${encodeURIComponent(entry.id)}`;
    }
    if (entry.membershipRole === "INSPECTOR") {
      return "/inspector";
    }
    return "/tenant";
  }

  function roleLabel(role: string): string {
    if (role === "ADMIN") return "Admin";
    if (role === "INSPECTOR") return "Inspector";
    if (role === "TENANT") return "Tenant";
    return role;
  }

  function portalCtaLabel(role: string): string {
    if (role === "ADMIN") return "Open admin portal";
    if (role === "INSPECTOR") return "Open inspector portal";
    if (role === "TENANT") return "Open tenant portal";
    return "Open portal";
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-black">
      <header className="animate-fade-in flex w-full items-center justify-between px-6 py-5 lg:px-12">
        <AppBrandReload className="flex cursor-pointer items-center gap-3 rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" />
        <AccountDrawer
          displayName={userName !== "there" ? userName : undefined}
          email={userEmail || undefined}
          shortcuts={[
            { href: "/home/new-property", label: "New property" },
            { href: "/settings", label: "Settings" },
          ]}
          onSignOut={handleSignOut}
        />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pt-12 pb-20 sm:pt-20 lg:pt-28">
        <div className="animate-fade-in-up-cascade flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          {/* Left: welcome + actions */}
          <div className="flex w-full min-w-0 flex-1 flex-col items-center text-center lg:max-w-xl lg:items-start lg:text-left">
            <div className="mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/20 sm:h-20 sm:w-20 lg:mb-8 lg:h-[5.25rem] lg:w-[5.25rem]">
              <span className="text-2xl font-bold text-white sm:text-3xl lg:text-3xl">I</span>
            </div>

            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-5xl">
              Hey {firstName},{" "}
              <span className="text-accent">welcome back.</span>
            </h1>

            <div className="mt-10 grid w-full gap-4 md:grid-cols-2 md:items-stretch md:gap-5 lg:mt-12">
              <Link
                href="/home/new-property"
                className="flex min-h-[176px] flex-col items-center justify-center rounded-2xl bg-primary px-5 py-7 text-center shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:shadow-white/10 md:min-h-0"
              >
                <span className="text-base font-semibold text-white dark:text-black sm:text-[1.05rem]">Create a property</span>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-white/85 dark:text-zinc-600">
                  Set up your organization and manage buildings, rooms, and inspections.
                </p>
                <span className="mt-3 text-sm font-semibold text-white dark:text-black">Get started →</span>
              </Link>

              <section
                id="join-invite"
                className="flex flex-col justify-center rounded-2xl border-2 border-zinc-200 bg-white p-4 text-left shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-5"
              >
                <h2 className="text-sm font-semibold text-foreground sm:text-base">Have an invite code?</h2>
                <p className="mt-1 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
                  Sign in with the same email your property team used on the invite. Paste the code (or open your invite
                  link)—we&apos;ll connect you as an inspector or resident.
                </p>
                <form
                  onSubmit={handleJoinWithCode}
                  className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch"
                >
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Invite code"
                    className="h-11 min-w-0 flex-1 rounded-xl border-2 border-zinc-200 bg-transparent px-3 text-center font-mono text-base tracking-widest text-foreground outline-none transition-colors focus:border-accent dark:border-zinc-700 sm:text-left"
                    maxLength={32}
                    disabled={joinLoading}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={joinLoading || !joinCode.trim()}
                    className="h-11 shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-black dark:shadow-white/10"
                  >
                    {joinLoading ? "Joining…" : "Join"}
                  </button>
                </form>
                {joinError && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                    {joinError.toLowerCase().includes("different email")
                      ? `${joinError} Sign in with the email address on the invite, or ask your property team to resend the invite to ${userEmail || "your current email"}.`
                      : joinError}
                  </p>
                )}
              </section>
            </div>
          </div>

          {/* Right: organizations — vertical scroll */}
          {orgAccess.length > 0 && (
            <div className="animate-fade-in-up-delay flex w-full min-h-0 shrink-0 flex-col lg:w-[min(100%,22rem)] xl:w-[min(100%,26rem)]">
              <h3 className="text-center text-lg font-semibold text-foreground lg:text-right">Your organizations</h3>
              <div className="mt-4 max-h-[min(55vh,22rem)] overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 [scrollbar-width:thin] lg:max-h-[calc(100dvh-9rem)]">
                <div className="flex flex-col gap-4">
                  {orgAccess.map((entry) => (
                    <Link
                      key={`${entry.id}-${entry.membershipRole}`}
                      href={hrefForAccess(entry)}
                      className="group flex w-full flex-col rounded-xl border-2 border-zinc-200 bg-white p-5 text-left transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {roleLabel(entry.membershipRole)}
                      </span>
                      <span className="mt-2 text-base font-semibold text-foreground">{entry.name}</span>
                      <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {formatOrganizationCardSubtitle(entry) || "Organization"}
                      </span>
                      <span className="mt-4 text-sm font-semibold text-accent transition-colors group-hover:underline">
                        {portalCtaLabel(entry.membershipRole)} →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {orgAccess.length === 0 && (
          <div className="mt-8 max-w-lg rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
            You&apos;re not connected to any organizations yet. Create a property or join with an invite code.
          </div>
        )}
      </main>

      <footer className="animate-fade-in border-t border-zinc-100 px-6 py-8 text-center dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} Inspect AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

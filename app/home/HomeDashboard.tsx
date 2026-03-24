"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOutUser, subscribeToAuthState } from "@/app/lib/firebase/auth";
import {
  getDocumentData,
  queryCollection,
  COLLECTIONS,
} from "@/app/lib/firebase/firestore";
import { where } from "firebase/firestore";
import type { UserRole } from "@/types";
import type { Organization } from "@/types/dorm";
import type { WithId } from "@/types";
import { Loader } from "@/components/Loader";

interface UserDocData {
  name?: string;
  role?: UserRole;
  dateOfBirth?: string;
}

interface MembershipDoc {
  userId: string;
  organizationId: string;
  role: string;
  status: string;
}

export function HomeDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [guardReady, setGuardReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organizations, setOrganizations] = useState<WithId<Organization>[]>([]);
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
      setUserRole((userData.role as UserRole) ?? null);

      const snapshot = await queryCollection(
        COLLECTIONS.memberships,
        where("userId", "==", user.uid),
        where("status", "==", "ACTIVE"),
      );
      const list: WithId<Organization>[] = [];
      for (const d of snapshot.docs) {
        const m = d.data() as MembershipDoc;
        const { data: org } = await getDocumentData<Organization>(
          COLLECTIONS.organizations,
          m.organizationId
        );
        if (org) list.push({ ...org, id: m.organizationId });
      }
      setOrganizations(list);
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
      const response = await fetch("/api/auth/join-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const payload = (await response.json()) as
        | { data?: { organizationId?: string } }
        | { error?: { message?: string } };
      if (!response.ok) {
        const message =
          "error" in payload ? payload.error?.message : undefined;
        throw new Error(message || "Invalid or expired code.");
      }
      const organizationId =
        "data" in payload ? payload.data?.organizationId : undefined;
      if (!organizationId) {
        throw new Error("Invite joined but organization was not returned.");
      }
      const { data: org } = await getDocumentData<Organization>(
        COLLECTIONS.organizations,
        organizationId
      );
      if (org) setOrganizations((prev) => [...prev, { ...org, id: organizationId }]);
      setJoinCode("");
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  if (!guardReady) {
    return <Loader fullPage />;
  }

  const isManager = userRole === "property_manager";
  const firstName = userName.split(/\s+/)[0] || userName;
  const deactivatedMembership = searchParams.get("status") === "deactivated";

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-sm">
              <span className="text-xs font-bold text-white">D</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dorm AI
            </h1>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        {isManager ? (
          <>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Hey {firstName},
            </h2>
            <p className="mb-8 text-zinc-600 dark:text-zinc-400">
              Manage your organizations or create a new one.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => (
                <Link
                  key={org.id}
                  href={`/manager/${org.id}`}
                  className="flex flex-col rounded-2xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-accent hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-accent"
                >
                  <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {org.name}
                  </span>
                  <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {org.slug}
                  </span>
                </Link>
              ))}
              <Link
                href="/home/new-property"
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-6 text-zinc-500 transition-all hover:border-accent hover:bg-accent/5 hover:text-accent dark:border-zinc-600 dark:bg-zinc-900 dark:hover:border-accent"
              >
                <span className="text-4xl leading-none">+</span>
                <span className="mt-2 text-sm font-medium">Create new organization</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Hey {firstName},
            </h2>
            {deactivatedMembership && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                Your previous membership appears inactive. Join with a new invite code to regain access.
              </div>
            )}
            <p className="mb-8 text-zinc-600 dark:text-zinc-400">
              Your portal. Pick an organization to get started.
            </p>

            {organizations.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                <p className="text-zinc-600 dark:text-zinc-400">
                  You&apos;re not part of any organization yet. Enter an invite code to join.
                </p>
                <form
                  onSubmit={handleJoinWithCode}
                  className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Invite code"
                    className="h-12 flex-1 rounded-xl border-2 border-zinc-200 bg-transparent px-4 text-center font-mono text-lg tracking-widest outline-none transition-colors focus:border-accent dark:border-zinc-700"
                    maxLength={12}
                    disabled={joinLoading}
                  />
                  <button
                    type="submit"
                    disabled={joinLoading || !joinCode.trim()}
                    className="h-12 rounded-xl bg-accent px-6 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {joinLoading ? "Joining…" : "Join"}
                  </button>
                </form>
                {joinError && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                    {joinError}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                  <Link
                    key={org.id}
                    href={userRole === "inspector" ? `/inspector` : `/tenant`}
                    className="flex flex-col rounded-2xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-accent hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-accent"
                  >
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {org.name}
                    </span>
                    <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {org.slug}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

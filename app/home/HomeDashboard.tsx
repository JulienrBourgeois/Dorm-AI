"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutUser, subscribeToAuthState } from "@/app/lib/firebase/auth";
import {
  getDocumentData,
  queryCollection,
  COLLECTIONS,
  dateToTimestamp,
  setDocument,
} from "@/app/lib/firebase/firestore";
import { auth } from "@/app/lib/firebase/app";
import { where } from "firebase/firestore";
import type { UserRole } from "@/types";
import type { University } from "@/types/dorm";
import type { WithId } from "@/types";
import { Loader } from "@/components/Loader";

interface UserDocData {
  name?: string;
  role?: UserRole;
  dateOfBirth?: string;
}

interface MembershipDoc {
  userId: string;
  universityId: string;
  role: string;
  status: string;
}

interface InviteCodeDoc {
  universityId: string;
  role: "INSPECTOR" | "TENANT";
}

export function HomeDashboard() {
  const router = useRouter();
  const [guardReady, setGuardReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [properties, setProperties] = useState<WithId<University>[]>([]);
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
        where("userId", "==", user.uid)
      );
      const unis: WithId<University>[] = [];
      for (const d of snapshot.docs) {
        const m = d.data() as MembershipDoc;
        const { data: uni } = await getDocumentData<University>(
          COLLECTIONS.universities,
          m.universityId
        );
        if (uni) unis.push({ ...uni, id: m.universityId });
      }
      setProperties(unis);
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
    const user = auth.currentUser;
    if (!user) {
      setJoinError("Session expired.");
      setJoinLoading(false);
      return;
    }
    try {
      const { data: codeDoc, exists } = await getDocumentData<InviteCodeDoc>(
        COLLECTIONS.inviteCodes,
        code
      );
      if (!exists || !codeDoc) {
        setJoinError("Invalid or expired code.");
        setJoinLoading(false);
        return;
      }
      const membershipId = `${user.uid}-${codeDoc.universityId}`;
      const now = dateToTimestamp(new Date());
      await setDocument(
        COLLECTIONS.memberships,
        membershipId,
        {
          userId: user.uid,
          universityId: codeDoc.universityId,
          role: codeDoc.role,
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
      const { data: uni } = await getDocumentData<University>(
        COLLECTIONS.universities,
        codeDoc.universityId
      );
      if (uni) setProperties((p) => [...p, { ...uni, id: codeDoc.universityId }]);
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
              Manage your properties or create a new one.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((uni) => (
                <Link
                  key={uni.id}
                  href={`/manager/${uni.id}`}
                  className="flex flex-col rounded-2xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-accent hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-accent"
                >
                  <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {uni.name}
                  </span>
                  <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {uni.slug}
                  </span>
                </Link>
              ))}
              <Link
                href="/home/new-property"
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-6 text-zinc-500 transition-all hover:border-accent hover:bg-accent/5 hover:text-accent dark:border-zinc-600 dark:bg-zinc-900 dark:hover:border-accent"
              >
                <span className="text-4xl leading-none">+</span>
                <span className="mt-2 text-sm font-medium">Create new property</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Hey {firstName},
            </h2>
            <p className="mb-8 text-zinc-600 dark:text-zinc-400">
              Your portal. Pick a property to get started.
            </p>

            {properties.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                <p className="text-zinc-600 dark:text-zinc-400">
                  You&apos;re not part of any property yet. Enter an invite code to join.
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
                {properties.map((uni) => (
                  <Link
                    key={uni.id}
                    href={userRole === "inspector" ? `/inspector` : `/tenant`}
                    className="flex flex-col rounded-2xl border-2 border-zinc-200 bg-white p-6 transition-all hover:border-accent hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-accent"
                  >
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {uni.name}
                    </span>
                    <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {uni.slug}
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

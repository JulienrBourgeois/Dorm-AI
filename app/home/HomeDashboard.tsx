"use client";

import { useRouter } from "next/navigation";
import { signOutUser } from "@/app/lib/firebase/auth";

export function HomeDashboard() {
  const router = useRouter();

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

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
      <main className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20 lg:mb-8 lg:h-20 lg:w-20">
            <span className="text-2xl font-bold text-white lg:text-3xl">D</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Welcome to Dorm AI
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 lg:mt-4 lg:text-base dark:text-zinc-400">
            Your dashboard is on the way. Role-based routing and the setup funnel are coming next.
          </p>
        </div>
      </main>
    </div>
  );
}

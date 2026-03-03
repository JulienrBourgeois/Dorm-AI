"use client";

import { useRouter } from "next/navigation";
import { signOutUser } from "@/app/lib/firebase/auth";
import { clearAuthCookie } from "@/lib/admin/adminAuth";

export function AdminDashboard() {
  const router = useRouter();

  async function handleSignOut() {
    clearAuthCookie();
    await signOutUser();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Dorm AI Admin
        </h1>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          Sign out
        </button>
      </header>
      <main className="px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-400">
            Admin dashboard placeholder. Content coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}

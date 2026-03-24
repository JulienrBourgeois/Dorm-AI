"use client";

import { useRouter } from "next/navigation";
import { signOutUser } from "@/app/lib/firebase/auth";
import { clearSessionCookie } from "@/lib/admin/adminAuth";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    if (!window.confirm("Are you sure you want to sign out?")) {
      return;
    }
    // Ensure middleware sees sign-out immediately.
    await clearSessionCookie();
    await signOutUser();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      Sign out
    </button>
  );
}


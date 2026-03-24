"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBrandReload } from "@/components/AppBrandReload";
import { signOutUser, subscribeToAuthState } from "@/app/lib/firebase/auth";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { clearSessionCookie } from "@/lib/admin/adminAuth";

export function NewPropertyHeader() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuthState((user) => {
      setDisplayName(user?.displayName?.trim() ?? "");
      setEmail(user?.email ?? "");
    });
    return unsub;
  }, []);

  async function onSignOut() {
    await clearSessionCookie();
    await signOutUser();
    router.push("/");
  }

  return (
    <header className="animate-fade-in flex w-full shrink-0 items-center justify-between gap-4 px-6 py-5 lg:px-12">
      <AppBrandReload />
      <AccountDrawer
        displayName={displayName || undefined}
        email={email || undefined}
        shortcuts={[
          { href: "/home/dashboard", label: "Home" },
          { href: "/settings", label: "Settings" },
        ]}
        onSignOut={onSignOut}
      />
    </header>
  );
}

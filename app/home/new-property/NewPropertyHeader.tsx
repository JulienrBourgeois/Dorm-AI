"use client";

import { useRouter } from "next/navigation";
import { AppBrandReload } from "@/components/AppBrandReload";
import { signOutUser } from "@/app/lib/firebase/auth";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { useAuthAccountProfile } from "@/hooks/auth/useAuthAccountProfile";
import { clearSessionCookie } from "@/lib/admin/adminAuth";

export function NewPropertyHeader() {
  const router = useRouter();
  const { displayName, email, photoUrl } = useAuthAccountProfile();

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
        photoUrl={photoUrl || undefined}
        shortcuts={[
          { href: "/home/dashboard", label: "Home" },
          { href: "/settings", label: "Profile" },
        ]}
        onSignOut={onSignOut}
      />
    </header>
  );
}

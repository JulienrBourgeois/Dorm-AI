"use client";

import { useRouter } from "next/navigation";
import { signOutUser } from "@/app/lib/firebase/auth";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { useAuthAccountProfile } from "@/hooks/auth/useAuthAccountProfile";
import { clearSessionCookie } from "@/lib/admin/adminAuth";
export function AdminHeaderAccount({ organizationId: _organizationId = "" }: { organizationId?: string }) {
  const router = useRouter();
  const { displayName, email, photoUrl } = useAuthAccountProfile();

  async function onSignOut() {
    await clearSessionCookie();
    await signOutUser();
    router.push("/");
  }

  return (
    <AccountDrawer
      displayName={displayName || undefined}
      email={email || undefined}
      photoUrl={photoUrl || undefined}
      onSignOut={onSignOut}
      shortcuts={[
        { href: "/home/dashboard", label: "Organizations" },
        { href: "/settings", label: "Profile" },
      ]}
    />
  );
}

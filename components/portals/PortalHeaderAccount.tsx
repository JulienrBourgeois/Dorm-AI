"use client";

import { useRouter } from "next/navigation";
import { signOutUser } from "@/app/lib/firebase/auth";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { useAuthAccountProfile } from "@/hooks/auth/useAuthAccountProfile";
import { clearSessionCookie } from "@/lib/admin/adminAuth";
import type { PortalKind } from "@/lib/portal/portalOrgNavigation";

export function PortalHeaderAccount({
  portal: _portal,
  organizationId: _organizationId = "",
}: {
  portal: PortalKind;
  organizationId?: string;
}) {
  const router = useRouter();
  const { displayName, email } = useAuthAccountProfile();

  const shortcuts = [
    { href: "/home/dashboard", label: "Organizations" },
    { href: "/settings", label: "Profile" },
  ];

  async function onSignOut() {
    await clearSessionCookie();
    await signOutUser();
    router.push("/");
  }

  return (
    <AccountDrawer
      displayName={displayName || undefined}
      email={email || undefined}
      onSignOut={onSignOut}
      shortcuts={shortcuts}
    />
  );
}

"use client";

import { useRouter } from "next/navigation";
import { signOutUser } from "@/app/lib/firebase/auth";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { useAuthAccountProfile } from "@/hooks/auth/useAuthAccountProfile";
import { clearSessionCookie } from "@/lib/admin/adminAuth";
import { withAdminOrganizationId } from "@/lib/admin/adminOrgQuery";
import type { PortalKind } from "@/lib/portal/portalOrgNavigation";

export function PortalHeaderAccount({
  portal,
  organizationId = "",
}: {
  portal: PortalKind;
  organizationId?: string;
}) {
  const router = useRouter();
  const orgId = organizationId.trim();
  const { displayName, email } = useAuthAccountProfile();

  const settingsHref =
    portal === "admin" && orgId
      ? withAdminOrganizationId("/admin/settings", orgId)
      : "/settings";

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
      shortcuts={[
        { href: "/home/dashboard", label: "Organizations" },
        { href: settingsHref, label: "Settings" },
      ]}
    />
  );
}

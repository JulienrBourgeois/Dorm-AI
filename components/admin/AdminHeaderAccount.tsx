"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signOutUser } from "@/app/lib/firebase/auth";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { clearSessionCookie } from "@/lib/admin/adminAuth";
import { withAdminOrganizationId } from "@/lib/admin/adminOrgQuery";

export function AdminHeaderAccount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const settingsHref = organizationId
    ? withAdminOrganizationId("/admin/settings", organizationId)
    : "/home/dashboard";

  async function onSignOut() {
    await clearSessionCookie();
    await signOutUser();
    router.push("/");
  }

  return (
    <AccountDrawer
      onSignOut={onSignOut}
      shortcuts={[
        { href: "/home/dashboard", label: "All organizations" },
        { href: settingsHref, label: "Settings" },
      ]}
    />
  );
}

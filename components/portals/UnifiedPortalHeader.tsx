"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminSidebarMobileToggle } from "@/components/admin/AdminSidebarNav";
import { PortalHeaderAccount } from "@/components/portals/PortalHeaderAccount";
import { PortalOrgSelector } from "@/components/portals/PortalOrgSelector";
import type { PortalKind } from "@/lib/portal/portalOrgNavigation";

export function UnifiedPortalHeader({ portal }: { portal: PortalKind }) {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AdminSidebarMobileToggle />
        <Suspense
          fallback={
            <div className="h-5 w-40 max-w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          }
        >
          <PortalOrgSelector portal={portal} />
        </Suspense>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Suspense
          fallback={
            <div className="h-9 w-9 shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
          }
        >
          <PortalHeaderAccount portal={portal} organizationId={organizationId} />
        </Suspense>
      </div>
    </header>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppBrandReload } from "@/components/AppBrandReload";
import { AdminHeaderAccount } from "@/components/admin/AdminHeaderAccount";
import { COLLECTIONS, getDocumentData } from "@/app/lib/firebase/firestore";
import type { Organization } from "@/types";

export function AdminAppHeader() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setOrgName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await getDocumentData<Organization>(
        COLLECTIONS.organizations,
        organizationId,
      );
      if (!cancelled) setOrgName(data?.name?.trim() || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  return (
    <header className="animate-fade-in flex w-full items-center justify-between gap-4 px-6 py-5 lg:px-12">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <AppBrandReload className="flex shrink-0 cursor-pointer items-center gap-3 rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:text-xs">
            Property manager
          </p>
          <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
            {organizationId
              ? orgName ?? "Loading…"
              : "Choose an organization"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/home/dashboard"
          className="rounded-xl px-2 py-2 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 sm:px-4 sm:text-sm"
        >
          <span className="sm:hidden">Organizations</span>
          <span className="hidden sm:inline">All organizations</span>
        </Link>
        <Suspense
          fallback={
            <div className="h-10 w-10 shrink-0 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
          }
        >
          <AdminHeaderAccount />
        </Suspense>
      </div>
    </header>
  );
}

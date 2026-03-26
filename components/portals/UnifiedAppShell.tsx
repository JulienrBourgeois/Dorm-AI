"use client";

import { Suspense, type ReactNode } from "react";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarProvider";
import { UnifiedPortalHeader } from "@/components/portals/UnifiedPortalHeader";
import type { PortalKind } from "@/lib/portal/portalOrgNavigation";

type Props = {
  portal: PortalKind;
  sidebar: ReactNode;
  children: ReactNode;
  showFooter?: boolean;
};

export function UnifiedAppShell({
  portal,
  sidebar,
  children,
  showFooter = false,
}: Props) {
  const year = new Date().getFullYear();

  return (
    <AdminSidebarProvider portal={portal}>
      <div className="flex h-[100dvh] overflow-hidden bg-white text-foreground dark:bg-black">
        <Suspense
          fallback={
            <div className="hidden w-60 shrink-0 border-r border-zinc-200 bg-white lg:block dark:border-zinc-800 dark:bg-zinc-950" />
          }
        >
          {sidebar}
        </Suspense>

        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense
            fallback={
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800 sm:px-6">
                <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-8 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            }
          >
            <UnifiedPortalHeader portal={portal} />
          </Suspense>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              {children}
            </div>

            {showFooter ? (
              <footer className="border-t border-zinc-100 px-6 py-6 text-center dark:border-zinc-800">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  &copy; {year} Inspect AI. All rights reserved.
                </p>
              </footer>
            ) : null}
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}

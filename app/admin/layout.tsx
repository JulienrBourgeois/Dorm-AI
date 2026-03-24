import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAppHeader } from "@/components/admin/AdminAppHeader";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export const metadata: Metadata = {
  title: "Property manager — Inspect AI",
  description: "Operations console for housing and property teams.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-black text-foreground">
      <Suspense
        fallback={
          <div className="flex h-[72px] items-center justify-between px-6 lg:px-12">
            <div className="h-9 w-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        }
      >
        <AdminAppHeader />
      </Suspense>

      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-12 pt-6 sm:pt-8 lg:flex-row lg:items-start lg:gap-12 lg:px-12 lg:pb-16 lg:pt-10">
          <aside className="w-full shrink-0 lg:sticky lg:top-8 lg:w-56 xl:w-64">
            <Suspense
              fallback={
                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                  Loading navigation…
                </div>
              }
            >
              <AdminSidebarNav />
            </Suspense>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      <footer className="border-t border-zinc-100 px-6 py-8 text-center dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {year} Inspect AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

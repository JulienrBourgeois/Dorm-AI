import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tenant — Dorm AI",
  description: "Tenant portal.",
};

export default function TenantPage() {
  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/home" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            ← Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Tenant portal
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Inspections, room info, and inbox coming next.
        </p>
      </main>
    </div>
  );
}

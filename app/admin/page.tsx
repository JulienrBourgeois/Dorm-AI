import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizations — Dorm AI",
  description: "Choose an organization to manage as a property manager.",
};

export default function AdminOrganizationSelectorPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Choose organization
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Select an organization to manage. In the real app, these cards will be driven by
          your access and organization assignments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">University of California, Berkeley</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Buildings</div>
              <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">6</div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tenants</div>
              <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">312</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              href="/admin/dashboard"
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">University of California, Los Angeles</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Buildings</div>
              <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">4</div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tenants</div>
              <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">198</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              href="/admin/dashboard"
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create organization</div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Wire this button to a “create organization” flow (modal or dedicated page).
          </p>
          <div className="mt-4">
            <button
              type="button"
              className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              + Create organization
            </button>
          </div>
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Profile controls (account settings) appear in the top bar.
          </div>
        </div>
      </div>
    </section>
  );
}


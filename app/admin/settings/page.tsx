import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Dorm AI",
  description: "Organization profile, permissions, notifications, and templates.",
};

export default function SettingsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Organization-level configuration: permissions, notification preferences, templates, and support info.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Organization profile</div>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Name</div>
              <div className="mt-1 font-semibold">North Campus Residences (sample)</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Primary contact</div>
              <div className="mt-1 text-zinc-700 dark:text-zinc-200">admin@berkeley.edu</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Configuration</div>
            <button
              type="button"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              disabled
            >
              Update configuration
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">User permissions</div>
              <div className="mt-2 text-xs">Placeholder: role assignments and feature gating.</div>
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">Notification preferences</div>
              <div className="mt-2 text-xs">Placeholder: email/SMS toggles + schedules.</div>
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300 md:col-span-2">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">Checklist template settings</div>
              <div className="mt-2 text-xs">Placeholder: templates, versioning, and item ordering.</div>
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300 md:col-span-2">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">Legal / support info</div>
              <div className="mt-2 text-xs">Placeholder: help links, terms, and contact details.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


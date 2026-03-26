import type { Metadata } from "next";
import {
  adminCardClass,
  adminPageDescClass,
  adminPageSectionClass,
  adminPageTitleClass,
  adminPrimaryBtnClass,
} from "@/components/admin/adminConsolePrimitives";

export const metadata: Metadata = {
  title: "Settings — Inspect AI",
  description: "Organization profile, permissions, notifications, and templates.",
};

export default function SettingsPage() {
  return (
    <section className={adminPageSectionClass}>
      <div>
        <h1 className={adminPageTitleClass}>Settings</h1>
        <p className={adminPageDescClass}>
          Organization-level configuration: permissions, notification preferences, templates, and support info.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`lg:col-span-1 ${adminCardClass}`}>
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

        <div className={`lg:col-span-2 ${adminCardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Configuration</div>
            <button type="button" className={adminPrimaryBtnClass} disabled>
              Update configuration
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">User permissions</div>
              <div className="mt-2 text-xs">Placeholder: role assignments and feature gating.</div>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">Notification preferences</div>
              <div className="mt-2 text-xs">Placeholder: email/SMS toggles + schedules.</div>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300 md:col-span-2">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">Checklist template settings</div>
              <div className="mt-2 text-xs">Placeholder: templates, versioning, and item ordering.</div>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300 md:col-span-2">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">Legal / support info</div>
              <div className="mt-2 text-xs">Placeholder: help links, terms, and contact details.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule inspection — Dorm AI",
};

export default function ScheduleInspectionPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Schedule Inspection
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Create a new scheduled inspection (modal in the future; page now).
          </p>
        </div>
        <Link
          href="/admin/inspections"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
        >
          Back to inspections
        </Link>
      </div>

      <form className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Room selector
            </label>
            <select
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
              disabled
              defaultValue=""
            >
              <option value="" disabled>
                Select a room
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Inspection type
            </label>
            <select
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
              disabled
              defaultValue=""
            >
              <option value="" disabled>
                Select a type
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Inspector selector
            </label>
            <select
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
              disabled
              defaultValue=""
            >
              <option value="" disabled>
                Select an inspector
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Scheduled date/time
            </label>
            <input
              type="datetime-local"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
              disabled
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Notes
            </label>
            <textarea
              className="min-h-[120px] w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
              disabled
              placeholder="Add any context for the inspector..."
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
            disabled
          >
            Save scheduled inspection
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Wired up after schema + backend actions exist.</span>
        </div>
      </form>
    </section>
  );
}


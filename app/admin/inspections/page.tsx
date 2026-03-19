import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspections — Dorm AI",
};

export default function InspectionsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Inspections Page
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Central management surface for inspections across the university.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/inspections/schedule"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            + Schedule inspection
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Filter: status
          </div>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            disabled
          >
            <option>All</option>
          </select>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Filter: type
          </div>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            disabled
          >
            <option>All</option>
          </select>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Filter: building
          </div>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            disabled
          >
            <option>All</option>
          </select>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Filter: inspector
          </div>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            disabled
          >
            <option>All</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Inspection Table
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scheduled / Completed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "i-2001", room: "2B-105", inspector: "Avery Johnson", type: "Move-out", status: "Scheduled", time: "Tomorrow, 10:00 AM" },
                { id: "i-1992", room: "2B-105", inspector: "Avery Johnson", type: "Routine", status: "Completed", time: "Mar 12, 3:20 PM" },
                { id: "i-1984", room: "1C-044", inspector: "Noah Rivera", type: "Routine", status: "Scheduled", time: "Thu, 9:00 AM" },
              ].map((ins) => (
                <tr key={ins.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-4">
                    <Link href={`/admin/inspections/${ins.id}`} className="font-semibold text-accent hover:underline">
                      {ins.room}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{ins.inspector}</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{ins.type}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{ins.status}</span>
                  </td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{ins.time}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/inspections/${ins.id}`}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                      >
                        Open detail
                      </Link>
                      <button
                        type="button"
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                        disabled
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                        disabled
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


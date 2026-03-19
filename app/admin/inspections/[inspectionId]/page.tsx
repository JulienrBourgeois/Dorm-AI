import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspection detail — Dorm AI",
};

export default function InspectionDetailPage({
  params,
}: {
  params: { inspectionId: string };
}) {
  const { inspectionId } = params;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Inspection Detail
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Review scheduled or completed inspection content, evidence, and AI summary.
          </p>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Inspection ID: {inspectionId}</div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/inspections"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
          >
            Back to inspections
          </Link>
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Review (authorized)
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Room info</div>
          <div className="mt-3 space-y-3 text-sm text-zinc-700 dark:text-zinc-200">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Room</div>
              <div className="mt-1 font-semibold">2B-105</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tenant</div>
              <div className="mt-1">Jordan Lee</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</div>
              <div className="mt-1">
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Checklist results</div>
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Placeholder for photo-documented checklist + pass/fail items.</div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800" disabled>
                Edit authorized fields
              </button>
              <button type="button" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800" disabled>
                Export evidence
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">Inspector info</div>
              <div className="mt-1 text-xs">Inspector: Avery Johnson</div>
              <div className="mt-2 text-xs">Scheduled time: Mar 19, 10:00 AM</div>
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100">AI summary</div>
              <div className="mt-1 text-xs">Summarized findings will render here.</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notes, media, damages/charges</div>
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1 rounded-2xl border border-dashed border-zinc-300 bg-white p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-black/40 dark:text-zinc-300">
                Notes placeholder
              </div>
              <div className="md:col-span-1 rounded-2xl border border-dashed border-zinc-300 bg-white p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-black/40 dark:text-zinc-300">
                Media placeholder
              </div>
              <div className="md:col-span-1 rounded-2xl border border-dashed border-zinc-300 bg-white p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-black/40 dark:text-zinc-300">
                Damages/charges placeholder
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Timestamps</div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {[
            { label: "Created", value: "Mar 12, 9:10 AM" },
            { label: "Scheduled", value: "Mar 19, 10:00 AM" },
            { label: "Inspection start", value: "Mar 19, 10:02 AM" },
            { label: "Completed", value: "Mar 19, 10:35 AM" },
          ].map((t) => (
            <div key={t.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t.label}</div>
              <div className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{t.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


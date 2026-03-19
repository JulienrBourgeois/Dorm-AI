import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenants — Dorm AI",
};

export default function TenantsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Tenants Page
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Searchable tenant table, room assignment, status, invite actions, and detail navigation.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:max-w-md">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Search tenants
          </label>
          <input
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="Name, email, tenant ID..."
            disabled
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
            disabled
          >
            Invite tenant
          </button>
          <Link
            href="/admin/tenants/new"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            + Add tenant
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Tenant Records
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "t-1021", name: "Jordan Lee", room: "2B-105", status: "Active" },
                { id: "t-1087", name: "Amira Khan", room: "3A-214", status: "Invited" },
                { id: "t-1110", name: "Taylor Smith", room: "1C-044", status: "Active" },
              ].map((t) => (
                <tr key={t.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">ID: {t.id}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{t.room}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/tenants/${t.id}`}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                      >
                        Details
                      </Link>
                      <button
                        type="button"
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                        disabled
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                        disabled
                      >
                        Assign room
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


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buildings — Dorm AI",
};

export default function BuildingsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Buildings Page
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Manage dorm-building inventory: codes, addresses, room counts, and CRUD actions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            disabled
          >
            + Create building
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Building Inventory
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: "BERK", address: "222 University Ave", rooms: 148 },
                { code: "UCLA", address: "10 West Campus Dr", rooms: 92 },
                { code: "SF", address: "500 Dorm Way", rooms: 61 },
              ].map((b) => (
                <tr key={b.code} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{b.code}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{b.address}</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{b.rooms}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800" disabled>
                        Edit
                      </button>
                      <button type="button" className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800" disabled>
                        Delete
                      </button>
                      <button type="button" className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800" disabled>
                        View rooms
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


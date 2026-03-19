import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rooms — Dorm AI",
};

export default function RoomsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Rooms Page
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Manage inspectable rooms: building/floor/capacity, assigned tenant, and current status.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:max-w-md">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Search rooms
          </label>
          <input
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="Room code, building, floor..."
            disabled
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
            disabled
          >
            Assign tenant
          </button>
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            disabled
          >
            + Create room
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Room Inventory
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Building</th>
                <th className="px-4 py-3">Floor</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Assigned tenant</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "r-2b-214", code: "2B-214", building: "BERK", floor: "2", cap: 1, tenant: "Jordan Lee", status: "Inspectable" },
                { id: "r-2b-105", code: "2B-105", building: "BERK", floor: "2", cap: 1, tenant: "Amira Khan", status: "In progress" },
                { id: "r-1c-044", code: "1C-044", building: "UCLA", floor: "1", cap: 1, tenant: "—", status: "Vacant" },
              ].map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{r.code}</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{r.building}</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{r.floor}</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{r.cap}</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{r.tenant}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{r.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
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
                        Assign tenant
                      </button>
                      <Link
                        href="/admin/rooms#room-record"
                        className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
                      >
                        Open room record
                      </Link>
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


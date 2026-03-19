import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Dorm AI",
  description: "Property manager operations overview.",
};

export default function AdminHomeDashboardPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Property manager dashboard
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          High-level operating view for the selected organization.
        </p>
      </div>

      {/* Top summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Total Buildings
          </div>
          <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">6</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Last 30 days: +0</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Total Rooms
          </div>
          <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">148</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Last 30 days: +2</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Total Tenants
          </div>
          <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">312</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Last 30 days: -1</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Total Inspectors
          </div>
          <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">14</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Last 30 days: +1</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Total Inspections
          </div>
          <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">245</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Last 30 days: +18</div>
        </div>
      </div>

      {/* Middle row: upcoming inspections + recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Upcoming Inspections</h2>
            <Link href="/admin/inspections" className="text-sm font-semibold text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: "Room 3A-214", date: "Tomorrow, 10:00 AM", status: "Scheduled", href: "/admin/inspections" },
              { label: "Room 2B-105", date: "Wed, 2:30 PM", status: "Scheduled", href: "/admin/inspections" },
              { label: "Room 1C-044", date: "Thu, 9:00 AM", status: "Scheduled", href: "/admin/inspections" },
            ].map((i) => (
              <div key={i.label} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{i.label}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{i.date}</div>
                  </div>
                  <div className="text-xs font-medium text-accent whitespace-nowrap">{i.status}</div>
                </div>
                <div className="mt-2">
                  <Link href={i.href} className="text-xs font-semibold text-accent hover:underline">
                    Open details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Activity</h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Tenant / Room / Building changes</span>
          </div>
          <div className="mt-4 space-y-3">
            {[
              {
                title: "Tenant reassigned",
                target: "Jordan Lee → Room 2B-105",
                time: "2h ago",
                href: "/admin/tenants/t-1021",
              },
              {
                title: "Room status changed",
                target: "2B-214: Vacant → Inspectable",
                time: "Yesterday",
                href: "/admin/rooms",
              },
              {
                title: "Building updated",
                target: "BERK address updated",
                time: "2 days ago",
                href: "/admin/buildings",
              },
              {
                title: "Inspection scheduled",
                target: "Move-out: Room 1C-044",
                time: "3 days ago",
                href: "/admin/inspections",
              },
            ].map((e) => (
              <div key={e.title} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{e.title}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{e.target}</div>
                  </div>
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{e.time}</div>
                </div>
                <div className="mt-2">
                  <Link href={e.href} className="text-xs font-semibold text-accent hover:underline">
                    Open related record
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower section: operational charts + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Operational Charts</h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Placeholders</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="h-40 rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Inspections by Status
              </div>
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Chart goes here</div>
            </div>
            <div className="h-40 rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Damages / Charges Trends
              </div>
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Chart goes here</div>
            </div>
            <div className="h-40 rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50 md:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Workload by Inspector (Next 30 days)
              </div>
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Chart goes here</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Quick Actions</h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Common operational tasks</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/admin/inspections/schedule"
              className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              + Schedule inspection
            </Link>
            <Link
              href="/admin/tenants"
              className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
            >
              Add tenant
            </Link>
            <Link
              href="/admin/inspectors"
              className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
            >
              Invite inspector
            </Link>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/admin/buildings"
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
              >
                Create building
              </Link>
              <Link
                href="/admin/rooms"
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
              >
                Create room
              </Link>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
            Quick actions can be wired to forms/modals once CRUD actions exist.
          </div>
        </div>
      </div>
    </section>
  );
}


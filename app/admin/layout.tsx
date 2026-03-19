import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata: Metadata = {
  title: "Property manager — Dorm AI",
  description: "Operations console for housing and property teams.",
};

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: "/admin", label: "Organization" },
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/inspectors", label: "Inspectors" },
  { href: "/admin/inspections", label: "Inspections" },
  { href: "/admin/buildings", label: "Buildings" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-zinc-50 text-foreground dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Property manager</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Active organization: <span className="text-accent">—</span>
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Top navigation: org switcher, search, notifications, profile */}
            <div className="hidden items-center gap-2 md:flex">
              <select
                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                disabled
                defaultValue=""
              >
                <option value="" disabled>
                  Organization
                </option>
              </select>
              <input
                className="h-10 w-[260px] rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-accent dark:border-zinc-800 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                placeholder="Search properties, tenants, inspections…"
                disabled
              />
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                disabled
                aria-label="Notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 10 6 8c0 7-3 7-3 7h18s-3 0-3-7" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </button>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                disabled
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold dark:bg-zinc-800">
                  A
                </span>
                Profile
              </button>
            </div>

            {/* Compact fallback for smaller screens */}
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 md:hidden"
            >
              Org
            </Link>

            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-8 lg:px-10">
        <aside className="col-span-12 lg:col-span-3">
          <nav className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Navigate
            </div>
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="col-span-12 lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { withAdminOrganizationId } from "@/lib/admin/adminOrgQuery";

const NAV_ITEMS: Array<{ path: string; label: string }> = [
  { path: "/admin/dashboard", label: "Dashboard" },
  { path: "/admin/tenants", label: "Tenants" },
  { path: "/admin/inspectors", label: "Inspectors" },
  { path: "/admin/inspections", label: "Inspections" },
  { path: "/admin/buildings", label: "Buildings" },
  { path: "/admin/rooms", label: "Rooms" },
  { path: "/admin/settings", label: "Settings" },
];

function linkActive(pathname: string, itemPath: string): boolean {
  if (itemPath === "/admin/dashboard") {
    return pathname === "/admin/dashboard";
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export function AdminSidebarNav() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  return (
    <nav className="rounded-2xl border-2 border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Navigate
      </div>
      {!organizationId ? (
        <p className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
          Open the admin console from your home page and pick an organization.
        </p>
      ) : null}
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = linkActive(pathname, item.path);
          return (
            <li key={item.path}>
              <Link
                href={
                  organizationId
                    ? withAdminOrganizationId(item.path, organizationId)
                    : "/home/dashboard"
                }
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

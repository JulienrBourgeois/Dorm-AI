"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAdminSidebar } from "@/components/admin/AdminSidebarProvider";
import { PortalSidebarBrand } from "@/components/portals/PortalSidebarBrand";
import { tenantPortalHref } from "@/lib/portal/portalOrgNavigation";

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconCollapse({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function IconExpand({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const NAV_LINK_ACTIVE =
  "bg-sky-100 text-sky-950 ring-1 ring-sky-200/80 dark:bg-sky-500/25 dark:text-sky-50 dark:ring-sky-400/35";
const NAV_LINK_ICON_ACTIVE = "text-sky-700 dark:text-sky-200";
const NAV_LINK_IDLE =
  "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800";
const NAV_LINK_ICON_IDLE =
  "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300";

export function TenantSidebarNav() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useAdminSidebar();

  const homeHref = tenantPortalHref(organizationId);
  const inspectionsActive = pathname === "/tenant" || pathname.startsWith("/tenant/inspections");

  const navList = (
    <ul className="flex flex-col gap-0.5">
      <li>
        <Link
          href={homeHref}
          onClick={() => setMobileOpen(false)}
          title={collapsed ? "Inspections" : undefined}
          className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
            collapsed ? "justify-center" : ""
          } ${inspectionsActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}`}
        >
          <IconHome
            className={`h-[18px] w-[18px] shrink-0 ${inspectionsActive ? NAV_LINK_ICON_ACTIVE : NAV_LINK_ICON_IDLE}`}
          />
          {!collapsed && <span>Inspections</span>}
        </Link>
      </li>
    </ul>
  );

  const navContent = (
    <>
      <PortalSidebarBrand collapsed={collapsed} />
      {!collapsed && (
        <div className="mt-1 px-3">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Resident portal
          </p>
        </div>
      )}
      <div className="mx-3 my-3 h-px bg-zinc-200 dark:bg-zinc-700" />
      <nav className="flex-1 overflow-y-auto px-2">{navList}</nav>
      <div className="hidden lg:block mt-auto border-t border-zinc-200 dark:border-zinc-700 px-2 py-2">
        <button
          type="button"
          onClick={toggle}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <IconExpand className="h-[18px] w-[18px] shrink-0" />
          ) : (
            <>
              <IconCollapse className="h-[18px] w-[18px] shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div
        className={`hidden h-full flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 lg:flex ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        {navContent}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-2xl dark:bg-zinc-950 animate-slide-in-left">
            <div className="flex items-center justify-between px-3 pt-3">
              <PortalSidebarBrand collapsed={false} padSection={false} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close navigation"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-3 my-3 h-px bg-zinc-200 dark:bg-zinc-700" />
            <nav className="flex-1 overflow-y-auto px-2">{navList}</nav>
          </div>
        </div>
      )}
    </>
  );
}

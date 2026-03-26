"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdminSidebar } from "@/components/admin/AdminSidebarProvider";
import { useInspectorExecutionActive } from "@/components/portals/InspectorRuntimeContext";
import { inspectorPortalHref } from "@/lib/portal/portalOrgNavigation";

function IconQueue({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconReview({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

const ITEMS: Array<{ view: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { view: "queue", label: "Queue", icon: IconQueue },
  { view: "review", label: "Review", icon: IconReview },
  { view: "settings", label: "Settings", icon: IconSettings },
];

function queueTabActive(viewParam: string | null, executionActive: boolean): boolean {
  const v = viewParam || "queue";
  if (v === "execution" || executionActive) return true;
  return v === "queue" || !viewParam;
}

export function InspectorSidebarNav() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const viewParam = searchParams.get("view");
  const executionActive = useInspectorExecutionActive();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useAdminSidebar();

  function itemActive(itemView: string): boolean {
    if (itemView === "queue") return queueTabActive(viewParam, executionActive);
    return (viewParam || "").toLowerCase() === itemView;
  }

  function hrefFor(itemView: string) {
    return inspectorPortalHref(organizationId, itemView);
  }

  const navList = (
    <ul className="flex flex-col gap-0.5">
      {ITEMS.map((item) => {
        const active = itemActive(item.view);
        const Icon = item.icon;
        return (
          <li key={item.view}>
            <Link
              href={hrefFor(item.view)}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
                collapsed ? "justify-center" : ""
              } ${active ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 ${active ? NAV_LINK_ICON_ACTIVE : NAV_LINK_ICON_IDLE}`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const navContent = (
    <>
      <div className={`flex items-center gap-3 px-3 pb-1 pt-3 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/15">
          <span className="text-sm font-bold text-white">I</span>
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">Inspect AI</span>
        )}
      </div>
      {!collapsed && (
        <div className="mt-1 px-3">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Inspector
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
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/15">
                  <span className="text-sm font-bold text-white">I</span>
                </div>
                <span className="text-sm font-semibold tracking-tight text-foreground">Inspect AI</span>
              </div>
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

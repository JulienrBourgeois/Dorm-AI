"use client";

import { AppLogoMark } from "@/components/AppLogoMark";

type PortalSidebarBrandProps = {
  /** When true, only the logo is shown (collapsed desktop sidebar). */
  collapsed: boolean;
  /**
   * Sidebar top block includes its own padding; mobile drawer header already has px/pt.
   */
  padSection?: boolean;
};

export function PortalSidebarBrand({
  collapsed,
  padSection = true,
}: PortalSidebarBrandProps) {
  const showLabel = !collapsed;

  const button = (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className={`flex min-w-0 max-w-full items-center gap-3 rounded-lg px-1 py-0.5 -mx-1 outline-offset-2 transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:hover:bg-zinc-800 ${
        collapsed ? "justify-center" : ""
      }`}
      aria-label="Reload page"
    >
      <AppLogoMark
        className="h-9 w-9"
        wrapperClassName="rounded-xl shadow-md shadow-primary/15"
        alt=""
      />
      {showLabel ? (
        <span className="truncate text-sm font-semibold tracking-tight text-foreground">
          Inspect AI
        </span>
      ) : null}
    </button>
  );

  if (!padSection) return button;

  return (
    <div
      className={`flex px-3 pb-1 pt-3 ${collapsed ? "justify-center" : ""}`}
    >
      {button}
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PortalKind } from "@/lib/portal/portalOrgNavigation";

type SidebarCtx = {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx>({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function AdminSidebarProvider({
  portal,
  children,
}: {
  portal: PortalKind;
  children: ReactNode;
}) {
  const storageKey = `inspectai-sidebar-collapsed:${portal}`;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "true") setCollapsed(true);
    } catch {}
  }, [storageKey]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}
      return next;
    });
  }, [storageKey]);

  return (
    <Ctx.Provider value={{ collapsed, toggle, mobileOpen, setMobileOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminSidebar() {
  return useContext(Ctx);
}

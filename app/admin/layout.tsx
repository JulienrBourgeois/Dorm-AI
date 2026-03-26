import type { Metadata } from "next";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { UnifiedAppShell } from "@/components/portals/UnifiedAppShell";

export const metadata: Metadata = {
  title: "Property manager — Inspect AI",
  description: "Operations console for housing and property teams.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnifiedAppShell portal="admin" sidebar={<AdminSidebarNav />} showFooter>
      {children}
    </UnifiedAppShell>
  );
}

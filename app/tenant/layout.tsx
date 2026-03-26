import type { Metadata } from "next";
import { TenantSidebarNav } from "@/components/portals/TenantSidebarNav";
import { UnifiedAppShell } from "@/components/portals/UnifiedAppShell";

export const metadata: Metadata = {
  title: "Resident portal — Inspect AI",
  description: "Tenant inspections and reports.",
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnifiedAppShell portal="tenant" sidebar={<TenantSidebarNav />}>
      {children}
    </UnifiedAppShell>
  );
}

import type { Metadata } from "next";
import { InspectorRuntimeProvider } from "@/components/portals/InspectorRuntimeContext";
import { InspectorSidebarNav } from "@/components/portals/InspectorSidebarNav";
import { UnifiedAppShell } from "@/components/portals/UnifiedAppShell";
import { InspectorPortalAuthGate } from "./InspectorPortalAuthGate";

export const metadata: Metadata = {
  title: "Inspector Portal — Inspect AI",
  description: "Inspector dashboard.",
};

export default function InspectorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <InspectorPortalAuthGate>
      <InspectorRuntimeProvider>
        <UnifiedAppShell portal="inspector" sidebar={<InspectorSidebarNav />}>
          {children}
        </UnifiedAppShell>
      </InspectorRuntimeProvider>
    </InspectorPortalAuthGate>
  );
}

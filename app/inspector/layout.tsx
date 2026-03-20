import type { Metadata } from "next";
import { InspectorPortalAuthGate } from "./InspectorPortalAuthGate";

export const metadata: Metadata = {
  title: "Inspector Portal — Dorm AI",
  description: "Inspector dashboard.",
};

export default function InspectorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <InspectorPortalAuthGate>{children}</InspectorPortalAuthGate>;
}

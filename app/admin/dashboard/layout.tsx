import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader } from "@/components/Loader";

export const metadata: Metadata = {
  title: "Dashboard — Inspect AI",
  description: "Property manager operations overview.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loader fullPage message="Loading dashboard…" />}>
      {children}
    </Suspense>
  );
}

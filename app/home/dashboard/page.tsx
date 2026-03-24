import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeDashboard } from "@/app/home/HomeDashboard";
import { Loader } from "@/components/Loader";

export const metadata: Metadata = {
  title: "Home — Inspect AI",
};

export default function HomeDashboardPage() {
  return (
    <Suspense fallback={<Loader fullPage message="Loading…" />}>
      <HomeDashboard />
    </Suspense>
  );
}

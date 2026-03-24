import type { Metadata } from "next";
import { Suspense } from "react";
import { InspectorsLifecycleClient } from "./InspectorsLifecycleClient";

export const metadata: Metadata = {
  title: "Inspectors — Dorm AI",
};

export default function InspectorsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" aria-hidden />}>
      <InspectorsLifecycleClient />
    </Suspense>
  );
}


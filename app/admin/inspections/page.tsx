import type { Metadata } from "next";
import { Suspense } from "react";
import { InspectionsListClient } from "./InspectionsListClient";

export const metadata: Metadata = {
  title: "Inspections — Inspect AI",
};

export default function InspectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" aria-hidden />}>
      <InspectionsListClient />
    </Suspense>
  );
}


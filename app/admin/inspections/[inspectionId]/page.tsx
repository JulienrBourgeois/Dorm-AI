import type { Metadata } from "next";
import { Suspense } from "react";
import { InspectionDetailClient } from "./InspectionDetailClient";

export const metadata: Metadata = {
  title: "Inspection detail — Inspect AI",
};

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ inspectionId: string }>;
}) {
  const { inspectionId } = await params;
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" aria-hidden />}>
      <InspectionDetailClient inspectionId={inspectionId} />
    </Suspense>
  );
}


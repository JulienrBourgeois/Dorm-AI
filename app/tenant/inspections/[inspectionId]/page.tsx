import type { Metadata } from "next";
import { Suspense } from "react";
import { TenantInspectionDetailClient } from "./TenantInspectionDetailClient";

export const metadata: Metadata = {
  title: "Tenant inspection detail - Inspect AI",
};

function DetailFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
      Loading inspection detail…
    </div>
  );
}

export default function TenantInspectionDetailPage({
  params,
}: {
  params: { inspectionId: string };
}) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <TenantInspectionDetailClient inspectionId={params.inspectionId} />
    </Suspense>
  );
}

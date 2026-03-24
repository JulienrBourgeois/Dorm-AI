import type { Metadata } from "next";
import { TenantInspectionDetailClient } from "./TenantInspectionDetailClient";

export const metadata: Metadata = {
  title: "Tenant inspection detail - Dorm AI",
};

export default function TenantInspectionDetailPage({
  params,
}: {
  params: { inspectionId: string };
}) {
  return <TenantInspectionDetailClient inspectionId={params.inspectionId} />;
}

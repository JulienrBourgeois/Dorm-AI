import type { Metadata } from "next";
import { ManagerPropertyDashboard } from "./ManagerPropertyDashboard";

export const metadata: Metadata = {
  title: "Property — Dorm AI",
  description: "Manage this property.",
};

export default async function ManagerPropertyPage({
  params,
}: {
  params: Promise<{ universityId: string }>;
}) {
  const { universityId } = await params;
  return <ManagerPropertyDashboard universityId={universityId} />;
}

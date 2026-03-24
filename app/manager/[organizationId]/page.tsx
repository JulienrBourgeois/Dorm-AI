import type { Metadata } from "next";
import { ManagerOrganizationDashboard } from "./ManagerOrganizationDashboard";

export const metadata: Metadata = {
  title: "Organization — Dorm AI",
  description: "Manage this organization.",
};

export default async function ManagerOrganizationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <ManagerOrganizationDashboard organizationId={organizationId} />;
}

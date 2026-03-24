import type { Metadata } from "next";
import { HomeDashboard } from "@/app/home/HomeDashboard";

export const metadata: Metadata = {
  title: "Home dashboard - Dorm AI",
};

export default function HomeDashboardPage() {
  return <HomeDashboard />;
}

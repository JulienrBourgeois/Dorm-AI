import type { Metadata } from "next";
import { AdminDashboard } from "@/app/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin — Dorm AI",
  description: "Dorm AI admin dashboard.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}

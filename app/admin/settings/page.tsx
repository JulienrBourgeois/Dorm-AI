import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const metadata: Metadata = {
  title: "Settings — Inspect AI",
  description: "Edit the selected organization's profile and contact details.",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" aria-hidden />}>
      <AdminSettingsClient />
    </Suspense>
  );
}
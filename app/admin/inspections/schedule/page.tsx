import type { Metadata } from "next";
import { Suspense } from "react";
import { ScheduleInspectionClient } from "./ScheduleInspectionClient";

export const metadata: Metadata = {
  title: "Schedule inspection — Dorm AI",
};

export default function ScheduleInspectionPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" aria-hidden />}>
      <ScheduleInspectionClient />
    </Suspense>
  );
}


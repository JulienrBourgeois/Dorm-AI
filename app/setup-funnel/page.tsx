import type { Metadata } from "next";
import { Suspense } from "react";
import { SetupFunnel } from "./SetupFunnel";

export const metadata: Metadata = {
  title: "Finish setting up — Dorm AI",
  description: "Complete your profile to get started.",
};

export default function SetupFunnelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" aria-hidden />}>
      <div className="animate-fade-in-up w-full">
        <SetupFunnel />
      </div>
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { SetupFunnel } from "./SetupFunnel";

export const metadata: Metadata = {
  title: "Finish setting up — Inspect AI",
  description: "Complete your profile to get started.",
};

export default function SetupFunnelPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-[100dvh] w-full bg-white dark:bg-black" aria-hidden />}
    >
      <div className="animate-fade-in-up min-h-[100dvh] w-full">
        <SetupFunnel />
      </div>
    </Suspense>
  );
}

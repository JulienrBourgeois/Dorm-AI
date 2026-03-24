import type { Metadata } from "next";
import { Suspense } from "react";
import { BuildingsCrudClient } from "./BuildingsCrudClient";

export const metadata: Metadata = {
  title: "Buildings — Inspect AI",
};

export default function BuildingsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" aria-hidden />}>
      <BuildingsCrudClient />
    </Suspense>
  );
}


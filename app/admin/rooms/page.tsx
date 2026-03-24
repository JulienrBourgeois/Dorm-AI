import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomsCrudClient } from "./RoomsCrudClient";

export const metadata: Metadata = {
  title: "Rooms — Inspect AI",
};

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" aria-hidden />}>
      <RoomsCrudClient />
    </Suspense>
  );
}


import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsProfileClient } from "./SettingsProfileClient";

export const metadata: Metadata = {
  title: "Profile — Inspect AI",
  description: "Edit your name and contact details.",
};

function SettingsFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white dark:bg-black" aria-hidden />
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsProfileClient />
    </Suspense>
  );
}

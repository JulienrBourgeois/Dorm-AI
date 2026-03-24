import type { Metadata } from "next";
import { BackLink } from "@/components/auth/ui";

export const metadata: Metadata = {
  title: "Settings — Inspect AI",
  description: "Account and app settings.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-white px-6 py-12 dark:bg-black">
      <div className="mb-8">
        <BackLink href="/home/dashboard" aria-label="Back to home" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        More account preferences and notifications will live here. For organization tools, open the
        property manager console if you have admin access.
      </p>
    </div>
  );
}

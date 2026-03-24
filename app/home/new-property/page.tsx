import type { Metadata } from "next";
import { NewPropertyForm } from "./NewPropertyForm";

export const metadata: Metadata = {
  title: "New organization — Dorm AI",
  description: "Create a new organization.",
};

export default function NewPropertyPage() {
  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-sm">
            <span className="text-xs font-bold text-white">D</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <NewPropertyForm />
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { NewPropertyForm } from "./NewPropertyForm";
import { NewPropertyHeader } from "./NewPropertyHeader";

export const metadata: Metadata = {
  title: "New organization — Inspect AI",
  description: "Create a new organization.",
};

export default function NewPropertyPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-black">
      <NewPropertyHeader />
      <main className="flex flex-1 flex-col items-center px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <NewPropertyForm />
      </main>
      <footer className="shrink-0 border-t border-zinc-100 px-6 py-8 text-center dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} Inspect AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

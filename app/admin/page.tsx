import type { Metadata } from "next";
import { AdminOrganizationSelectorClient } from "./AdminOrganizationSelectorClient";

export const metadata: Metadata = {
  title: "Organizations — Dorm AI",
  description: "Choose an organization to manage as a property manager.",
};

export default function AdminOrganizationSelectorPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Choose organization
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Select an organization to manage. This list is loaded from your active admin memberships.
        </p>
      </div>
      <AdminOrganizationSelectorClient />
    </section>
  );
}

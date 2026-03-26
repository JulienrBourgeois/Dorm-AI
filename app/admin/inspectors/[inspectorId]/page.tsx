import Link from "next/link";
import type { Metadata } from "next";
import {
  adminCardClass,
  adminPageDescClass,
  adminPageSectionClass,
  adminPageTitleClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
  adminTableHeaderRowClass,
} from "@/components/admin/adminConsolePrimitives";
import { withAdminOrganizationId } from "@/lib/admin/adminOrgQuery";

export const metadata: Metadata = {
  title: "Inspector detail — Inspect AI",
};

export default async function InspectorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ inspectorId: string }>;
  searchParams: Promise<{ organizationId?: string }>;
}) {
  const { inspectorId } = await params;
  const { organizationId } = await searchParams;
  const oid = organizationId?.trim() ?? "";
  const inspectionsHref = oid ? withAdminOrganizationId("/admin/inspections", oid) : "/home/dashboard";
  const editHref = oid
    ? withAdminOrganizationId(`/admin/inspectors/${inspectorId}/edit`, oid)
    : "/home/dashboard";

  return (
    <section className={adminPageSectionClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={adminPageTitleClass}>Inspector detail</h1>
          <p className={adminPageDescClass}>
            Profile and inspection workload (assigned buildings, scheduled/completed inspections, activity summary).
          </p>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Inspector ID: {inspectorId}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={editHref} className={adminSecondaryBtnClass}>
            Update assignments
          </Link>
          <button type="button" className={adminPrimaryBtnClass}>
            Review performance context
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${adminCardClass} lg:col-span-1`}>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inspector info</div>
          <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Name
              </span>
              <div className="mt-1 font-semibold">Avery Johnson</div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Contact
              </span>
              <div className="mt-1">avery.johnson@example.edu</div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Assigned buildings
              </span>
              <div className="mt-1 font-semibold">Berkeley (6)</div>
            </div>
          </div>
        </div>

        <div className={`${adminCardClass} lg:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inspection workload</div>
            <Link href={inspectionsHref} className="text-sm font-semibold text-accent hover:underline">
              Go to inspections
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[660px] w-full border-collapse text-sm">
              <thead>
                <tr className={adminTableHeaderRowClass}>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Activity</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">3 upcoming</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">21 total</td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      Placeholder summary
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">2 awaiting approval</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">14 last 30 days</td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-accent">On track</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
            Scheduled/completed inspection lists and performance context will go here.
          </div>
        </div>
      </div>
    </section>
  );
}

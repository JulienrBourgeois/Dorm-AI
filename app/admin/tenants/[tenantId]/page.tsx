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
  title: "Tenant detail — Inspect AI",
};

export default async function TenantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ organizationId?: string }>;
}) {
  const { tenantId } = await params;
  const { organizationId } = await searchParams;
  const oid = organizationId?.trim() ?? "";
  const inspectionsHref = oid ? withAdminOrganizationId("/admin/inspections", oid) : "/home/dashboard";
  const editHref = oid
    ? withAdminOrganizationId(`/admin/tenants/${tenantId}/edit`, oid)
    : "/home/dashboard";

  return (
    <section className={adminPageSectionClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={adminPageTitleClass}>Tenant detail</h1>
          <p className={adminPageDescClass}>
            Tenant profile and housing context (room assignment, membership status, inspection history, charges, notes).
          </p>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Tenant ID: {tenantId}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={editHref} className={adminSecondaryBtnClass}>
            Edit tenant
          </Link>
          <button type="button" className={adminPrimaryBtnClass}>
            Reassign room
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${adminCardClass} lg:col-span-1`}>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tenant info</div>
          <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Name
              </span>
              <div className="mt-1 font-semibold">Jordan Lee</div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Email
              </span>
              <div className="mt-1">jordan.lee@example.edu</div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Membership status
              </span>
              <div className="mt-1">
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${adminCardClass} lg:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inspection history</div>
            <Link href={inspectionsHref} className="text-sm font-semibold text-accent hover:underline">
              View all inspections
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse text-sm">
              <thead>
                <tr className={adminTableHeaderRowClass}>
                  <th className="px-4 py-3">Inspection</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { inspection: "Move-out", room: "2B-214", result: "Completed" },
                  { inspection: "Routine", room: "2B-214", result: "Completed" },
                  { inspection: "Move-in", room: "1C-044", result: "Scheduled" },
                ].map((row) => (
                  <tr key={`${row.inspection}-${row.room}`} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{row.inspection}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{row.room}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
            Full inspection history and charge context will render here.
          </div>
        </div>
      </div>
    </section>
  );
}

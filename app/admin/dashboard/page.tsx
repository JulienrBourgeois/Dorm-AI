"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { where } from "firebase/firestore";
import {
  COLLECTIONS,
  getDocumentData,
  queryCollection,
} from "@/app/lib/firebase/firestore";
import type {
  Building,
  Inspection,
  Membership,
  Organization,
  Room,
  WithId,
} from "@/types";
import { withAdminOrganizationId } from "@/lib/admin/adminOrgQuery";
import {
  organizationTypeLabel,
  formatOrganizationCardSubtitle,
} from "@/lib/organizationDisplay";
import { Loader } from "@/components/Loader";

type InspectionRow = WithId<Inspection> & { roomNumber: string };

function formatTimestamp(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleDateString();
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  return String(value);
}

function statusColor(status: string) {
  if (status === "COMPLETED")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
  if (status === "IN_PROGRESS") return "bg-accent/10 text-accent";
  if (status === "CANCELED")
    return "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
}

function inspectionTypeLabel(t: string) {
  if (t === "MOVE_IN") return "Move-in";
  if (t === "MOVE_OUT") return "Move-out";
  if (t === "ROUTINE") return "Routine";
  return t;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<Organization | null>(null);
  const [buildings, setBuildings] = useState<WithId<Building>[]>([]);
  const [rooms, setRooms] = useState<WithId<Room>[]>([]);
  const [tenantCount, setTenantCount] = useState(0);
  const [inspectorCount, setInspectorCount] = useState(0);
  const [inspections, setInspections] = useState<InspectionRow[]>([]);

  useEffect(() => {
    if (!organizationId) {
      router.replace("/home/dashboard");
      return;
    }
    (async () => {
      setLoading(true);
      const [orgDoc, buildSnap, roomSnap, memberSnap, inspSnap] =
        await Promise.all([
          getDocumentData<Organization>(COLLECTIONS.organizations, organizationId),
          queryCollection(
            COLLECTIONS.buildings,
            where("organizationId", "==", organizationId),
          ),
          queryCollection(
            COLLECTIONS.rooms,
            where("organizationId", "==", organizationId),
          ),
          queryCollection(
            COLLECTIONS.memberships,
            where("organizationId", "==", organizationId),
            where("status", "==", "ACTIVE"),
          ),
          queryCollection(
            COLLECTIONS.inspections,
            where("organizationId", "==", organizationId),
          ),
        ]);

      setOrg(orgDoc.data ?? null);

      const bList = buildSnap.docs.map((d) => ({
        ...(d.data() as Building),
        id: d.id,
      }));
      setBuildings(bList);

      const rList = roomSnap.docs.map((d) => ({
        ...(d.data() as Room),
        id: d.id,
      }));
      setRooms(rList);

      let tenants = 0;
      let inspectors = 0;
      for (const d of memberSnap.docs) {
        const role = (d.data() as Membership).role;
        if (role === "TENANT") tenants++;
        if (role === "INSPECTOR") inspectors++;
      }
      setTenantCount(tenants);
      setInspectorCount(inspectors);

      const roomMap = new Map<string, string>();
      for (const r of rList) roomMap.set(r.id, r.number);

      const iList: InspectionRow[] = inspSnap.docs.map((d) => {
        const data = d.data() as Inspection;
        return {
          ...data,
          id: d.id,
          roomNumber: roomMap.get(data.roomId) ?? data.roomLabel ?? "—",
        };
      });
      iList.sort((a, b) => String(b.scheduledFor).localeCompare(String(a.scheduledFor)));
      setInspections(iList);
      setLoading(false);
    })();
  }, [organizationId, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16">
        <Loader message="Loading dashboard…" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="animate-fade-in-up-cascade flex flex-col items-center rounded-2xl border-2 border-zinc-200 bg-white px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          We couldn&apos;t load this organization.
        </p>
        <Link
          href="/home/dashboard"
          className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg dark:bg-white dark:text-black"
        >
          Back to all organizations
        </Link>
      </div>
    );
  }

  const q = (path: string) => withAdminOrganizationId(path, organizationId);

  const upcoming = inspections.filter(
    (i) => i.status === "SCHEDULED" || i.status === "IN_PROGRESS",
  );
  const completed = inspections.filter((i) => i.status === "COMPLETED");

  const stats = [
    { label: "Buildings", value: buildings.length, href: q("/admin/buildings") },
    { label: "Rooms", value: rooms.length, href: q("/admin/rooms") },
    { label: "Tenants", value: tenantCount, href: `${q("/admin/tenants")}#tenant-records` },
    { label: "Inspectors", value: inspectorCount, href: `${q("/admin/inspectors")}#inspector-records` },
    { label: "Inspections", value: inspections.length, href: q("/admin/inspections") },
  ];

  const typeLabel = organizationTypeLabel(org.organizationType);
  const subtitle = formatOrganizationCardSubtitle(org);

  return (
    <section className="animate-fade-in-up-cascade flex w-full flex-col gap-10">
      {/* Hero — same rhythm as marketing / home hub */}
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <div className="mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/20 sm:h-20 sm:w-20 lg:mb-8 lg:h-[5.25rem] lg:w-[5.25rem]">
          <span className="text-2xl font-bold text-white sm:text-3xl lg:text-3xl">
            {org.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-5xl">
          {org.name}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg dark:text-zinc-400">
          {subtitle ||
            (typeLabel ? `${typeLabel} · Operations overview` : null) ||
            "Your property command center—buildings, rooms, people, and inspections in one place."}
        </p>
      </div>

      {/* Org details */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-md shadow-primary/15">
          {org.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">{org.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            {typeLabel && <span>{typeLabel}</span>}
            {org.addressLine1 && <span>{org.addressLine1}</span>}
            {org.city && org.state && (
              <span>
                {org.city}, {org.state} {org.postalCode ?? ""}
              </span>
            )}
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                Website ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {s.label}
            </div>
            <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {s.value}
            </div>
            <div className="mt-2 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              View →
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column: upcoming + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming inspections */}
        <div className="rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Upcoming inspections
            </h2>
            <Link
              href={q("/admin/inspections")}
              className="text-sm font-semibold text-accent hover:underline"
            >
              View all
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              No scheduled or in-progress inspections yet.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {upcoming.slice(0, 5).map((ins) => (
                <Link
                  key={ins.id}
                  href={q(`/admin/inspections/${ins.id}`)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Room {ins.roomNumber}
                      </span>
                      <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                        {inspectionTypeLabel(ins.type)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatTimestamp(ins.scheduledFor)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColor(ins.status)}`}
                  >
                    {ins.status === "IN_PROGRESS" ? "In progress" : "Scheduled"}
                  </span>
                </Link>
              ))}
              {upcoming.length > 5 && (
                <p className="pt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  + {upcoming.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Quick actions
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href={q("/admin/inspections/schedule")}
              className="flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-black dark:shadow-white/10"
            >
              + Schedule inspection
            </Link>
            <Link
              href={`${q("/admin/tenants")}#tenant-records`}
              className="flex h-11 items-center justify-center rounded-xl border-2 border-zinc-200 bg-white text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Manage tenants
            </Link>
            <Link
              href={`${q("/admin/inspectors")}#inspector-records`}
              className="flex h-11 items-center justify-center rounded-xl border-2 border-zinc-200 bg-white text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Manage inspectors
            </Link>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href={q("/admin/buildings")}
                className="flex h-11 items-center justify-center rounded-xl border-2 border-zinc-200 bg-white text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Buildings
              </Link>
              <Link
                href={q("/admin/rooms")}
                className="flex h-11 items-center justify-center rounded-xl border-2 border-zinc-200 bg-white text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Rooms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Completed inspections */}
      <div className="rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Completed inspections
          </h2>
          <Link
            href={q("/admin/inspections")}
            className="text-sm font-semibold text-accent hover:underline"
          >
            View all
          </Link>
        </div>

        {completed.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No completed inspections yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <th className="px-3 py-2">Room</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Scheduled</th>
                  <th className="px-3 py-2">Completed</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {completed.slice(0, 8).map((ins) => (
                  <tr
                    key={ins.id}
                    className="border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={q(`/admin/inspections/${ins.id}`)}
                        className="font-medium text-accent hover:underline"
                      >
                        {ins.roomNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
                      {inspectionTypeLabel(ins.type)}
                    </td>
                    <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatTimestamp(ins.scheduledFor)}
                    </td>
                    <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatTimestamp(ins.completedAt)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor(ins.status)}`}
                      >
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {completed.length > 8 && (
              <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Showing 8 of {completed.length}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Buildings overview */}
      {buildings.length > 0 && (
        <div className="rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Buildings
            </h2>
            <Link
              href={q("/admin/buildings")}
              className="text-sm font-semibold text-accent hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((b) => {
              const roomCount = rooms.filter((r) => r.buildingId === b.id).length;
              return (
                <Link
                  key={b.id}
                  href={q(`/admin/rooms`) + `&buildingId=${b.id}`}
                  className="group rounded-xl border-2 border-zinc-200 bg-zinc-50 p-4 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {b.name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {b.code} · {roomCount} room{roomCount !== 1 ? "s" : ""}
                  </p>
                  {b.address && (
                    <p className="mt-1 truncate text-xs text-zinc-400 dark:text-zinc-500">
                      {b.address}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

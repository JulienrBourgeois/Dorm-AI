"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { where } from "firebase/firestore";
import { toast } from "sonner";
import { logAuditEvent } from "@/app/lib/audit/logEvent";
import {
  COLLECTIONS,
  getDocumentData,
  queryCollection,
  updateDocument,
  dateToTimestamp,
} from "@/app/lib/firebase/firestore";
import type { Building, Inspection, InspectionStatus, InspectionType, Room, User, WithId } from "@/types";

type InspectorMembershipDoc = {
  userId: string;
  organizationId: string;
  role: "INSPECTOR";
};

type InspectionRow = WithId<Inspection> & {
  roomNumber?: string;
  buildingName?: string;
  inspectorName?: string;
};

function statusPillClass(status: InspectionStatus) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
  if (status === "IN_PROGRESS") return "bg-accent/10 text-accent";
  if (status === "CANCELED") return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
  return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
}

function formatDate(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  return String(value);
}

export function InspectionsListClient() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | InspectionStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | InspectionType>("ALL");
  const [buildingFilter, setBuildingFilter] = useState<string>("ALL");
  const [inspectorFilter, setInspectorFilter] = useState<string>("ALL");

  const [buildings, setBuildings] = useState<Array<WithId<Building>>>([]);
  const [inspectors, setInspectors] = useState<Array<{ userId: string; name: string }>>([]);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [inspectionsSnap, roomsSnap, buildingsSnap, inspectorMembershipSnap] = await Promise.all([
        queryCollection(COLLECTIONS.inspections, where("organizationId", "==", organizationId)),
        queryCollection(COLLECTIONS.rooms, where("organizationId", "==", organizationId)),
        queryCollection(COLLECTIONS.buildings, where("organizationId", "==", organizationId)),
        queryCollection(
          COLLECTIONS.memberships,
          where("organizationId", "==", organizationId),
          where("role", "==", "INSPECTOR"),
        ),
      ]);

      const roomMap: Record<string, WithId<Room>> = {};
      for (const doc of roomsSnap.docs) {
        roomMap[doc.id] = { ...(doc.data() as Room), id: doc.id };
      }

      const buildingMap: Record<string, WithId<Building>> = {};
      const buildingList: Array<WithId<Building>> = [];
      for (const doc of buildingsSnap.docs) {
        const b = { ...(doc.data() as Building), id: doc.id };
        buildingMap[b.id] = b;
        buildingList.push(b);
      }
      buildingList.sort((a, b) => a.code.localeCompare(b.code));
      setBuildings(buildingList);

      const inspectorUserIds = new Set<string>();
      for (const doc of inspectorMembershipSnap.docs) {
        const membership = doc.data() as InspectorMembershipDoc;
        inspectorUserIds.add(membership.userId);
      }

      const inspectorUserMap: Record<string, string> = {};
      for (const userId of inspectorUserIds) {
        const { data } = await getDocumentData<User>(COLLECTIONS.users, userId);
        inspectorUserMap[userId] = data?.name || "Unknown inspector";
      }
      setInspectors(
        [...inspectorUserIds]
          .map((id) => ({ userId: id, name: inspectorUserMap[id] }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      const nextRows: InspectionRow[] = inspectionsSnap.docs.map((doc) => {
        const inspection = doc.data() as Inspection;
        const room = roomMap[inspection.roomId];
        const building = room ? buildingMap[room.buildingId] : undefined;
        return {
          ...inspection,
          id: doc.id,
          roomNumber: room?.number,
          buildingName: building ? `${building.code} - ${building.name}` : undefined,
          inspectorName: inspectorUserMap[inspection.inspectorId] || inspection.inspectorId,
        };
      });

      nextRows.sort((a, b) => {
        const aTs = formatDate(a.scheduledFor);
        const bTs = formatDate(b.scheduledFor);
        return aTs.localeCompare(bTs);
      });
      setRows(nextRows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load inspections.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && row.type !== typeFilter) return false;
      if (buildingFilter !== "ALL") {
        const building = buildings.find((b) => b.id === buildingFilter);
        if (!building || !row.buildingName?.includes(building.code)) return false;
      }
      if (inspectorFilter !== "ALL" && row.inspectorId !== inspectorFilter) return false;
      return true;
    });
  }, [rows, statusFilter, typeFilter, buildingFilter, inspectorFilter, buildings]);

  async function setStatus(row: InspectionRow, next: InspectionStatus) {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        status: next,
        updatedAt: dateToTimestamp(new Date()),
      };
      if (next === "IN_PROGRESS") payload.startedAt = dateToTimestamp(new Date());
      if (next === "COMPLETED") payload.completedAt = dateToTimestamp(new Date());
      if (next === "SCHEDULED") {
        payload.startedAt = null;
        payload.completedAt = null;
      }
      await updateDocument(COLLECTIONS.inspections, row.id, payload);
      await logAuditEvent({
        eventType: "inspection.status.changed",
        actorId: row.createdBy || "admin",
        entityType: "inspection",
        entityId: row.id,
        inspectionId: row.id,
        organizationId: row.organizationId,
        fromStatus: row.status,
        toStatus: next,
        source: "admin.inspections.list",
      });
      toast.success(`Inspection moved to ${next}.`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update inspection.");
    } finally {
      setSaving(false);
    }
  }

  if (!organizationId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        Go to{" "}
        <Link href="/home/dashboard" className="font-semibold underline">
          home
        </Link>{" "}
        and open an organization you admin to manage inspections.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Inspections</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Schedule, track, and transition inspection states for the selected organization.
          </p>
        </div>
        <Link
          href={`/admin/inspections/schedule?organizationId=${organizationId}`}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          + Schedule inspection
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Filter: status</div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | InspectionStatus)}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="ALL">All</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Filter: type</div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "ALL" | InspectionType)}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="ALL">All</option>
            <option value="MOVE_IN">Move-in</option>
            <option value="ROUTINE">Routine</option>
            <option value="MOVE_OUT">Move-out</option>
          </select>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Filter: building</div>
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="ALL">All</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Filter: inspector</div>
          <select
            value={inspectorFilter}
            onChange={(e) => setInspectorFilter(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="ALL">All</option>
            {inspectors.map((i) => (
              <option key={i.userId} value={i.userId}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Inspection Table
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scheduled / Completed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/inspections/${row.id}?organizationId=${organizationId}`}
                      className="font-semibold text-accent hover:underline"
                    >
                      {row.roomNumber ?? row.roomLabel}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{row.buildingName ?? "—"}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{row.inspectorName ?? row.inspectorId}</td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{row.type}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                    {row.status === "COMPLETED" ? formatDate(row.completedAt) : formatDate(row.scheduledFor)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/inspections/${row.id}?organizationId=${organizationId}`}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                      >
                        Open detail
                      </Link>
                      {row.status === "SCHEDULED" && (
                        <button
                          type="button"
                          onClick={() => void setStatus(row, "IN_PROGRESS")}
                          disabled={saving}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                        >
                          Start
                        </button>
                      )}
                      {(row.status === "SCHEDULED" || row.status === "IN_PROGRESS") && (
                        <button
                          type="button"
                          onClick={() => void setStatus(row, "CANCELED")}
                          disabled={saving}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No inspections found for this organization.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

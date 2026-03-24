"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOutUser, subscribeToAuthState } from "@/app/lib/firebase/auth";
import {
  COLLECTIONS,
  getDocumentData,
  queryCollection,
} from "@/app/lib/firebase/firestore";
import type {
  Building,
  Inspection,
  InspectionStatus,
  Membership,
  Room,
  Organization,
  User,
  WithId,
} from "@/types";

type InspectionRow = WithId<Inspection> & {
  inspectorName: string;
  roomNumber: string;
  buildingLabel: string;
};

function formatDate(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  return String(value);
}

function statusPillClass(status: InspectionStatus) {
  if (status === "COMPLETED") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
  }
  if (status === "IN_PROGRESS") return "bg-accent/10 text-accent";
  if (status === "CANCELED") {
    return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
}

export function TenantInspectionsClient() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [tenantName, setTenantName] = useState("Tenant");
  const [organizationName, setOrganizationName] = useState("—");
  const [roomLabel, setRoomLabel] = useState("—");
  const [inspections, setInspections] = useState<InspectionRow[]>([]);

  const activeInspections = useMemo(
    () =>
      inspections.filter(
        (inspection) =>
          inspection.status === "SCHEDULED" || inspection.status === "IN_PROGRESS",
      ),
    [inspections],
  );

  const completedInspections = useMemo(
    () => inspections.filter((inspection) => inspection.status === "COMPLETED"),
    [inspections],
  );

  const refreshTenantData = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const [userDoc, membershipSnap, inspectionSnap] = await Promise.all([
        getDocumentData<User>(COLLECTIONS.users, uid),
        queryCollection(
          COLLECTIONS.memberships,
          where("userId", "==", uid),
          where("role", "==", "TENANT"),
          where("status", "==", "ACTIVE"),
        ),
        queryCollection(COLLECTIONS.inspections, where("tenantIds", "array-contains", uid)),
      ]);

      setTenantName(userDoc.data?.name || "Tenant");
      const activeMembership = membershipSnap.docs[0]?.data() as Membership | undefined;
      if (activeMembership) {
        const [orgDoc, roomDoc] = await Promise.all([
          getDocumentData<Organization>(COLLECTIONS.organizations, activeMembership.organizationId),
          activeMembership.roomId
            ? getDocumentData<Room>(COLLECTIONS.rooms, activeMembership.roomId)
            : Promise.resolve({ data: undefined, exists: false }),
        ]);
        setOrganizationName(orgDoc.data?.name || "—");
        setRoomLabel(roomDoc.data?.number || "—");
      } else {
        setOrganizationName("—");
        setRoomLabel("—");
      }

      const rows: InspectionRow[] = [];
      for (const doc of inspectionSnap.docs) {
        const inspection = doc.data() as Inspection;
        const [roomDoc, inspectorDoc] = await Promise.all([
          getDocumentData<Room>(COLLECTIONS.rooms, inspection.roomId),
          getDocumentData<User>(COLLECTIONS.users, inspection.inspectorId),
        ]);

        let buildingLabel = "—";
        if (roomDoc.data?.buildingId) {
          const { data: buildingDoc } = await getDocumentData<Building>(
            COLLECTIONS.buildings,
            roomDoc.data.buildingId,
          );
          if (buildingDoc) {
            buildingLabel = `${buildingDoc.code} - ${buildingDoc.name}`;
          }
        }

        rows.push({
          ...inspection,
          id: doc.id,
          roomNumber: roomDoc.data?.number || inspection.roomLabel || "—",
          inspectorName: inspectorDoc.data?.name || inspection.inspectorId,
          buildingLabel,
        });
      }

      rows.sort((a, b) =>
        formatDate(b.scheduledFor).localeCompare(formatDate(a.scheduledFor)),
      );
      setInspections(rows);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load tenant inspections.",
      );
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        router.replace("/signup?step=login-chooser");
        return;
      }
      setUserId(user.uid);
      await refreshTenantData(user.uid);
    });
    return unsubscribe;
  }, [refreshTenantData, router]);

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
            Loading tenant portal...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-10">
          <div>
            <div className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Tenant inspections
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {tenantName} - {organizationName}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 lg:px-10">
        <section className="rounded-2xl border border-sky-200 bg-sky-50/40 p-5 dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Your inspection timeline
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                View scheduled and completed inspections, checklist outcomes, and
                uploaded evidence.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
              Assigned room: {roomLabel}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Active inspections ({activeInspections.length})
          </div>
          <div className="mt-4 space-y-3">
            {activeInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {inspection.roomNumber} - {inspection.type}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {inspection.buildingLabel} - Inspector: {inspection.inspectorName}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Scheduled: {formatDate(inspection.scheduledFor)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(
                      inspection.status,
                    )}`}
                  >
                    {inspection.status}
                  </span>
                  <Link
                    href={`/tenant/inspections/${inspection.id}`}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:bg-black dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-900"
                  >
                    Open detail
                  </Link>
                </div>
              </div>
            ))}
            {!loading && activeInspections.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No active inspections for your room right now.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Completed inspections ({completedInspections.length})
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                  <th className="px-4 py-3">Inspection</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedInspections.map((inspection) => (
                  <tr
                    key={inspection.id}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {inspection.roomNumber} - {inspection.type}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {inspection.buildingLabel}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {inspection.inspectorName}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {formatDate(inspection.completedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(
                          inspection.status,
                        )}`}
                      >
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/tenant/inspections/${inspection.id}`}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:bg-black dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-900"
                      >
                        View report
                      </Link>
                    </td>
                  </tr>
                ))}
                {!loading && completedInspections.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      No completed inspections yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {userId ? (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Visibility is scoped to inspections where your tenant ID is assigned.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BackLink } from "@/components/auth/ui";
import { where } from "firebase/firestore";
import { toast } from "sonner";
import { logAuditEvent } from "@/app/lib/audit/logEvent";
import {
  COLLECTIONS,
  addDocument,
  dateToTimestamp,
  getDocumentData,
  queryCollection,
} from "@/app/lib/firebase/firestore";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import type { Building, InspectionType, Room, User, WithId } from "@/types";

type InspectorMembershipDoc = {
  userId: string;
  organizationId: string;
  role: "INSPECTOR";
  status: "ACTIVE" | "INVITED" | "INACTIVE";
};

type TenantMembershipDoc = {
  userId: string;
  organizationId: string;
  role: "TENANT";
  status: "ACTIVE" | "INVITED" | "INACTIVE";
  roomId?: string;
};

export function ScheduleInspectionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [rooms, setRooms] = useState<Array<WithId<Room>>>([]);
  const [buildings, setBuildings] = useState<Record<string, WithId<Building>>>({});
  const [inspectors, setInspectors] = useState<Array<{ userId: string; name: string }>>([]);

  const [roomId, setRoomId] = useState("");
  const [type, setType] = useState<InspectionType>("ROUTINE");
  const [inspectorId, setInspectorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuthState((user) => {
      setCurrentUserId(user?.uid ?? "");
    });
    return unsub;
  }, []);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [roomsSnap, buildingsSnap, inspectorMembershipSnap] = await Promise.all([
        queryCollection(COLLECTIONS.rooms, where("organizationId", "==", organizationId)),
        queryCollection(COLLECTIONS.buildings, where("organizationId", "==", organizationId)),
        queryCollection(
          COLLECTIONS.memberships,
          where("organizationId", "==", organizationId),
          where("role", "==", "INSPECTOR"),
          where("status", "==", "ACTIVE"),
        ),
      ]);

      const roomList: Array<WithId<Room>> = roomsSnap.docs.map((doc) => ({
        ...(doc.data() as Room),
        id: doc.id,
      }));
      roomList.sort((a, b) => a.number.localeCompare(b.number));
      setRooms(roomList);
      if (!roomId && roomList[0]) setRoomId(roomList[0].id);

      const buildingMap: Record<string, WithId<Building>> = {};
      for (const doc of buildingsSnap.docs) {
        const b = { ...(doc.data() as Building), id: doc.id };
        buildingMap[b.id] = b;
      }
      setBuildings(buildingMap);

      const inspectorList: Array<{ userId: string; name: string }> = [];
      for (const doc of inspectorMembershipSnap.docs) {
        const m = doc.data() as InspectorMembershipDoc;
        const { data: user } = await getDocumentData<User>(COLLECTIONS.users, m.userId);
        inspectorList.push({
          userId: m.userId,
          name: user?.name || m.userId,
        });
      }
      inspectorList.sort((a, b) => a.name.localeCompare(b.name));
      setInspectors(inspectorList);
      if (!inspectorId && inspectorList[0]) setInspectorId(inspectorList[0].userId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load scheduling data.");
    } finally {
      setLoading(false);
    }
  }, [inspectorId, roomId, organizationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const roomLabel = useMemo(() => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return "";
    const building = buildings[room.buildingId];
    return building ? `${building.code}-${room.number}` : room.number;
  }, [rooms, roomId, buildings]);

  async function handleCreateInspection() {
    if (!organizationId) return;
    if (!roomId || !inspectorId || !scheduledAt) {
      toast.error("Room, inspector, and scheduled date/time are required.");
      return;
    }
    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      toast.error("Please enter a valid schedule date/time.");
      return;
    }

    setSaving(true);
    try {
      const tenantMembershipSnap = await queryCollection(
        COLLECTIONS.memberships,
        where("organizationId", "==", organizationId),
        where("role", "==", "TENANT"),
        where("status", "==", "ACTIVE"),
        where("roomId", "==", roomId),
      );
      const tenantIds = tenantMembershipSnap.docs.map((doc) => {
        const tenant = doc.data() as TenantMembershipDoc;
        return tenant.userId;
      });

      const now = dateToTimestamp(new Date());
      const createdInspectionRef = await addDocument(COLLECTIONS.inspections, {
        organizationId,
        roomId,
        inspectorId,
        type,
        status: "SCHEDULED",
        scheduledFor: dateToTimestamp(scheduledDate),
        roomLabel: roomLabel || "Room",
        tenantIds,
        createdBy: currentUserId || "system",
        notes: notes.trim() || null,
        createdAt: now,
        updatedAt: now,
      });
      await logAuditEvent({
        eventType: "inspection.created",
        actorId: currentUserId || "system",
        entityType: "inspection",
        entityId: createdInspectionRef.id,
        inspectionId: createdInspectionRef.id,
        organizationId,
        toStatus: "SCHEDULED",
        source: "admin.inspection.schedule",
      });

      toast.success("Inspection scheduled.");
      router.push(`/admin/inspections?organizationId=${organizationId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule inspection.");
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
        and open an organization you admin to schedule inspections.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Schedule Inspection
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Create a new scheduled inspection for this organization.
          </p>
        </div>
        <BackLink
          href={`/admin/inspections?organizationId=${organizationId}`}
          aria-label="Back to inspections"
          className="mb-0"
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleCreateInspection();
        }}
        className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Room selector
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            >
              {rooms.map((room) => {
                const building = buildings[room.buildingId];
                const label = building ? `${building.code} - ${room.number}` : room.number;
                return (
                  <option key={room.id} value={room.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Inspection type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InspectionType)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="MOVE_IN">Move-in</option>
              <option value="ROUTINE">Routine</option>
              <option value="MOVE_OUT">Move-out</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Inspector selector
            </label>
            <select
              value={inspectorId}
              onChange={(e) => setInspectorId(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            >
              {inspectors.map((inspector) => (
                <option key={inspector.userId} value={inspector.userId}>
                  {inspector.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Scheduled date/time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
              placeholder="Add any context for the inspector..."
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="submit"
            disabled={saving || loading || rooms.length === 0 || inspectors.length === 0}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            Save scheduled inspection
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            This writes to Firestore with status `SCHEDULED`.
          </span>
        </div>
      </form>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BackLink } from "@/components/auth/ui";
import { where } from "firebase/firestore";
import { toast } from "sonner";
import {
  COLLECTIONS,
  addDocument,
  dateToTimestamp,
  getDocumentData,
  queryCollection,
} from "@/app/lib/firebase/firestore";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import { AdminSelect } from "@/components/admin/AdminSelect";
import {
  adminCardClass,
  adminEmptyStateClass,
  adminInputClass,
  adminPageDescClass,
  adminPageSectionClass,
  adminPageTitleClass,
  adminPrimaryBtnClass,
  adminTextareaClass,
} from "@/components/admin/adminConsolePrimitives";
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

  const roomOptions = useMemo(
    () =>
      rooms.map((room) => {
        const building = buildings[room.buildingId];
        const label = building ? `${building.code} — ${room.number}` : room.number;
        return { value: room.id, label };
      }),
    [rooms, buildings],
  );

  const typeOptions = useMemo(
    () => [
      { value: "MOVE_IN", label: "Move-in" },
      { value: "ROUTINE", label: "Routine" },
      { value: "MOVE_OUT", label: "Move-out" },
    ],
    [],
  );

  const inspectorOptions = useMemo(
    () => inspectors.map((i) => ({ value: i.userId, label: i.name })),
    [inspectors],
  );

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
      <div className={adminEmptyStateClass}>
        Go to{" "}
        <Link href="/home/dashboard" className="font-semibold underline">
          home
        </Link>{" "}
        and open an organization you admin to schedule inspections.
      </div>
    );
  }

  return (
    <section className={adminPageSectionClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={adminPageTitleClass}>Schedule inspection</h1>
          <p className={adminPageDescClass}>
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
        className={adminCardClass}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Room
            </label>
            <AdminSelect
              value={roomId}
              onChange={setRoomId}
              options={roomOptions}
              disabled={rooms.length === 0}
              aria-label="Select room"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Inspection type
            </label>
            <AdminSelect
              value={type}
              onChange={(v) => setType(v as InspectionType)}
              options={typeOptions}
              aria-label="Inspection type"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Inspector
            </label>
            <AdminSelect
              value={inspectorId}
              onChange={setInspectorId}
              options={inspectorOptions}
              disabled={inspectors.length === 0}
              aria-label="Select inspector"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Scheduled date and time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={adminInputClass}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={adminTextareaClass}
              placeholder="Add any context for the inspector…"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="submit"
            disabled={saving || loading || rooms.length === 0 || inspectors.length === 0}
            className={adminPrimaryBtnClass}
          >
            Save scheduled inspection
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Saves to Firestore with status SCHEDULED.
          </span>
        </div>
      </form>
    </section>
  );
}

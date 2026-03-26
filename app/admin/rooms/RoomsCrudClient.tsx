"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { where } from "firebase/firestore";
import { toast } from "sonner";
import {
  COLLECTIONS,
  addDocument,
  dateToTimestamp,
  deleteDocument,
  queryCollection,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import { AdminSelect } from "@/components/admin/AdminSelect";
import {
  adminCardClass,
  adminCardTableWrapClass,
  adminEmptyStateClass,
  adminInputClass,
  adminInputTableClass,
  adminPageDescClass,
  adminPageSectionClass,
  adminPageTitleClass,
  adminPrimaryBtnCompactClass,
  adminSecondaryBtnClass,
  adminTableHeaderRowClass,
} from "@/components/admin/adminConsolePrimitives";
import type { Building, Room, WithId } from "@/types";

type RoomForm = {
  buildingId: string;
  number: string;
  floor: string;
  capacity: string;
};

const EMPTY_FORM: RoomForm = {
  buildingId: "",
  number: "",
  floor: "",
  capacity: "1",
};

export function RoomsCrudClient() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const requestedBuildingId = searchParams.get("buildingId")?.trim() ?? "";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState(requestedBuildingId);
  const [buildings, setBuildings] = useState<Array<WithId<Building>>>([]);
  const [rooms, setRooms] = useState<Array<WithId<Room>>>([]);
  const [createForm, setCreateForm] = useState<RoomForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RoomForm>(EMPTY_FORM);

  const refreshData = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [buildingsSnap, roomsSnap] = await Promise.all([
        queryCollection(COLLECTIONS.buildings, where("organizationId", "==", organizationId)),
        queryCollection(COLLECTIONS.rooms, where("organizationId", "==", organizationId)),
      ]);

      const nextBuildings: Array<WithId<Building>> = buildingsSnap.docs.map((doc) => ({
        ...(doc.data() as Building),
        id: doc.id,
      }));
      nextBuildings.sort((a, b) => a.code.localeCompare(b.code));
      setBuildings(nextBuildings);

      const nextRooms: Array<WithId<Room>> = roomsSnap.docs.map((doc) => ({
        ...(doc.data() as Room),
        id: doc.id,
      }));
      nextRooms.sort((a, b) => a.number.localeCompare(b.number));
      setRooms(nextRooms);

      setCreateForm((prev) => ({
        ...prev,
        buildingId: prev.buildingId || requestedBuildingId || nextBuildings[0]?.id || "",
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }, [requestedBuildingId, organizationId]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const buildingMap = useMemo(() => {
    const map: Record<string, WithId<Building>> = {};
    for (const b of buildings) map[b.id] = b;
    return map;
  }, [buildings]);

  const buildingSelectOptions = useMemo(
    () =>
      buildings.map((b) => ({
        value: b.id,
        label: `${b.code} — ${b.name}`,
      })),
    [buildings],
  );

  const createBuildingOptions = useMemo(
    () => [
      { value: "", label: "Select building" },
      ...buildings.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` })),
    ],
    [buildings],
  );

  const filterBuildingOptions = useMemo(
    () => [{ value: "", label: "All buildings" }, ...buildingSelectOptions],
    [buildingSelectOptions],
  );

  const filteredRooms = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rooms.filter((room) => {
      if (buildingFilter && room.buildingId !== buildingFilter) return false;
      if (!term) return true;
      const building = buildingMap[room.buildingId];
      const hay = `${room.number} ${building?.code ?? ""} ${building?.name ?? ""} ${room.floor ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [buildingFilter, buildingMap, rooms, search]);

  async function handleCreateRoom() {
    if (!organizationId) return;
    const buildingId = createForm.buildingId.trim();
    const number = createForm.number.trim();
    const floorRaw = createForm.floor.trim();
    const capacityRaw = createForm.capacity.trim();
    const capacity = Number(capacityRaw);
    if (!buildingId || !number || !capacityRaw) {
      toast.error("Building, room number, and capacity are required.");
      return;
    }
    if (Number.isNaN(capacity) || capacity < 1) {
      toast.error("Capacity must be a positive number.");
      return;
    }

    setSaving(true);
    try {
      const now = dateToTimestamp(new Date());
      await addDocument(COLLECTIONS.rooms, {
        organizationId,
        buildingId,
        number,
        floor: floorRaw ? Number(floorRaw) : undefined,
        capacity,
        createdAt: now,
        updatedAt: now,
      } satisfies Omit<Room, "createdAt" | "updatedAt"> & {
        createdAt: ReturnType<typeof dateToTimestamp>;
        updatedAt: ReturnType<typeof dateToTimestamp>;
      });
      setCreateForm((prev) => ({ ...EMPTY_FORM, buildingId: prev.buildingId }));
      toast.success("Room created.");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create room.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(room: WithId<Room>) {
    setEditingId(room.id);
    setEditForm({
      buildingId: room.buildingId,
      number: room.number,
      floor: room.floor?.toString() ?? "",
      capacity: room.capacity.toString(),
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const buildingId = editForm.buildingId.trim();
    const number = editForm.number.trim();
    const floorRaw = editForm.floor.trim();
    const capacity = Number(editForm.capacity.trim());
    if (!buildingId || !number) {
      toast.error("Building and room number are required.");
      return;
    }
    if (Number.isNaN(capacity) || capacity < 1) {
      toast.error("Capacity must be a positive number.");
      return;
    }

    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.rooms, editingId, {
        buildingId,
        number,
        floor: floorRaw ? Number(floorRaw) : null,
        capacity,
        updatedAt: dateToTimestamp(new Date()),
      });
      toast.success("Room updated.");
      setEditingId(null);
      setEditForm(EMPTY_FORM);
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update room.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRoom(roomId: string) {
    if (!confirm("Delete this room?")) return;
    setSaving(true);
    try {
      await deleteDocument(COLLECTIONS.rooms, roomId);
      toast.success("Room deleted.");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete room.");
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
        and open an organization you admin so rooms stay scoped correctly.
      </div>
    );
  }

  return (
    <section className={adminPageSectionClass}>
      <div>
        <h1 className={adminPageTitleClass}>Rooms</h1>
        <p className={adminPageDescClass}>
          Organization-scoped room inventory with live create, edit, and delete actions.
        </p>
      </div>

      <div className={adminCardClass}>
        <div className="grid gap-3 md:grid-cols-5">
          <AdminSelect
            value={createForm.buildingId}
            onChange={(v) => setCreateForm((s) => ({ ...s, buildingId: v }))}
            options={createBuildingOptions}
            disabled={buildings.length === 0}
            aria-label="Building for new room"
          />
          <input
            value={createForm.number}
            onChange={(e) => setCreateForm((s) => ({ ...s, number: e.target.value }))}
            placeholder="Room number (e.g. 2B-105)"
            className={adminInputClass}
          />
          <input
            value={createForm.floor}
            onChange={(e) => setCreateForm((s) => ({ ...s, floor: e.target.value }))}
            placeholder="Floor (optional)"
            className={adminInputClass}
          />
          <input
            value={createForm.capacity}
            onChange={(e) => setCreateForm((s) => ({ ...s, capacity: e.target.value }))}
            placeholder="Capacity"
            className={adminInputClass}
          />
          <button
            type="button"
            onClick={() => void handleCreateRoom()}
            disabled={saving || buildings.length === 0}
            className={`${adminPrimaryBtnCompactClass} w-full md:w-auto`}
          >
            + Create room
          </button>
        </div>
      </div>

      <div className={adminCardTableWrapClass}>
        <div className="border-b border-zinc-200 px-5 py-4 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Room inventory
        </div>
        <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by room number, building…"
            className={adminInputClass}
          />
          <AdminSelect
            value={buildingFilter}
            onChange={setBuildingFilter}
            options={filterBuildingOptions}
            aria-label="Filter by building"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full border-collapse text-sm">
            <thead>
              <tr className={adminTableHeaderRowClass}>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Building</th>
                <th className="px-4 py-3">Floor</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Assigned tenant</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const isEditing = editingId === room.id;
                const building = buildingMap[room.buildingId];
                return (
                  <tr key={room.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {isEditing ? (
                        <input
                          value={editForm.number}
                          onChange={(e) => setEditForm((s) => ({ ...s, number: e.target.value }))}
                          className={`${adminInputTableClass} w-40`}
                        />
                      ) : (
                        room.number
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {isEditing ? (
                        <AdminSelect
                          size="sm"
                          value={editForm.buildingId}
                          onChange={(v) => setEditForm((s) => ({ ...s, buildingId: v }))}
                          options={buildingSelectOptions}
                          aria-label="Building"
                        />
                      ) : building ? (
                        `${building.code} - ${building.name}`
                      ) : (
                        room.buildingId
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {isEditing ? (
                        <input
                          value={editForm.floor}
                          onChange={(e) => setEditForm((s) => ({ ...s, floor: e.target.value }))}
                          className={`${adminInputTableClass} w-24`}
                        />
                      ) : (
                        room.floor ?? "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {isEditing ? (
                        <input
                          value={editForm.capacity}
                          onChange={(e) => setEditForm((s) => ({ ...s, capacity: e.target.value }))}
                          className={`${adminInputTableClass} w-24`}
                        />
                      ) : (
                        room.capacity
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">—</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Inspectable</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleSaveEdit()}
                              disabled={saving}
                              className={adminPrimaryBtnCompactClass}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditForm(EMPTY_FORM);
                              }}
                              className={adminSecondaryBtnClass}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(room)}
                              className={adminSecondaryBtnClass}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteRoom(room.id)}
                              disabled={saving}
                              className={adminSecondaryBtnClass}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredRooms.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No rooms found for this organization.
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

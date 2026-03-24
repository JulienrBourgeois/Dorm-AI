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
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        Select an organization first from <Link href="/admin" className="underline">/admin</Link> so rooms are scoped correctly.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Rooms
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Organization-scoped room inventory with live create, edit, and delete actions.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-5">
          <select
            value={createForm.buildingId}
            onChange={(e) => setCreateForm((s) => ({ ...s, buildingId: e.target.value }))}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="" disabled>Select building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
          <input
            value={createForm.number}
            onChange={(e) => setCreateForm((s) => ({ ...s, number: e.target.value }))}
            placeholder="Room number (e.g. 2B-105)"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <input
            value={createForm.floor}
            onChange={(e) => setCreateForm((s) => ({ ...s, floor: e.target.value }))}
            placeholder="Floor (optional)"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <input
            value={createForm.capacity}
            onChange={(e) => setCreateForm((s) => ({ ...s, capacity: e.target.value }))}
            placeholder="Capacity"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={() => void handleCreateRoom()}
            disabled={saving || buildings.length === 0}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            + Create room
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Room Inventory
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by room number, building code/name..."
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="">All buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
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
                          className="h-9 w-40 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
                        />
                      ) : (
                        room.number
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {isEditing ? (
                        <select
                          value={editForm.buildingId}
                          onChange={(e) => setEditForm((s) => ({ ...s, buildingId: e.target.value }))}
                          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          {buildings.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.code} - {b.name}
                            </option>
                          ))}
                        </select>
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
                          className="h-9 w-24 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
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
                          className="h-9 w-24 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
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
                              className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditForm(EMPTY_FORM);
                              }}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(room)}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteRoom(room.id)}
                              disabled={saving}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
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

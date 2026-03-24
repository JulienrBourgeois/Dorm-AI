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

type BuildingForm = {
  name: string;
  code: string;
  address: string;
};

const EMPTY_FORM: BuildingForm = {
  name: "",
  code: "",
  address: "",
};

export function BuildingsCrudClient() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [buildings, setBuildings] = useState<Array<WithId<Building>>>([]);
  const [roomCountByBuilding, setRoomCountByBuilding] = useState<Record<string, number>>({});
  const [createForm, setCreateForm] = useState<BuildingForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BuildingForm>(EMPTY_FORM);

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

      const counts: Record<string, number> = {};
      for (const roomDoc of roomsSnap.docs) {
        const room = roomDoc.data() as Room;
        counts[room.buildingId] = (counts[room.buildingId] ?? 0) + 1;
      }
      setRoomCountByBuilding(counts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load buildings.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const filteredBuildings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return buildings;
    return buildings.filter((b) => {
      const hay = `${b.code} ${b.name} ${b.address ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [buildings, search]);

  async function handleCreateBuilding() {
    if (!organizationId) return;
    const name = createForm.name.trim();
    const code = createForm.code.trim().toUpperCase();
    const address = createForm.address.trim();
    if (!name || !code) {
      toast.error("Building name and code are required.");
      return;
    }

    setSaving(true);
    try {
      const now = dateToTimestamp(new Date());
      await addDocument(COLLECTIONS.buildings, {
        organizationId,
        name,
        code,
        address,
        createdAt: now,
        updatedAt: now,
      } satisfies Omit<Building, "createdAt" | "updatedAt"> & {
        createdAt: ReturnType<typeof dateToTimestamp>;
        updatedAt: ReturnType<typeof dateToTimestamp>;
      });
      setCreateForm(EMPTY_FORM);
      toast.success("Building created.");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create building.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(building: WithId<Building>) {
    setEditingId(building.id);
    setEditForm({
      name: building.name,
      code: building.code,
      address: building.address ?? "",
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const name = editForm.name.trim();
    const code = editForm.code.trim().toUpperCase();
    const address = editForm.address.trim();
    if (!name || !code) {
      toast.error("Building name and code are required.");
      return;
    }

    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.buildings, editingId, {
        name,
        code,
        address,
        updatedAt: dateToTimestamp(new Date()),
      });
      toast.success("Building updated.");
      setEditingId(null);
      setEditForm(EMPTY_FORM);
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update building.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBuilding(buildingId: string) {
    if (!confirm("Delete this building? Rooms linked to it should be reassigned first.")) return;
    setSaving(true);
    try {
      await deleteDocument(COLLECTIONS.buildings, buildingId);
      toast.success("Building deleted.");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete building.");
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
        and open an organization you admin so buildings stay scoped correctly.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Buildings
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Organization-scoped building inventory with live create, edit, and delete actions.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={createForm.name}
            onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="Building name"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <input
            value={createForm.code}
            onChange={(e) => setCreateForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
            placeholder="Code (e.g. BERK)"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <input
            value={createForm.address}
            onChange={(e) => setCreateForm((s) => ({ ...s, address: e.target.value }))}
            placeholder="Address (optional)"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={() => void handleCreateBuilding()}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            + Create building
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Building Inventory
        </div>
        <div className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, or address..."
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuildings.map((building) => {
                const isEditing = editingId === building.id;
                return (
                  <tr key={building.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {isEditing ? (
                        <input
                          value={editForm.code}
                          onChange={(e) => setEditForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
                          className="h-9 w-28 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
                        />
                      ) : (
                        building.code
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {isEditing ? (
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
                        />
                      ) : (
                        building.name
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {isEditing ? (
                        <input
                          value={editForm.address}
                          onChange={(e) => setEditForm((s) => ({ ...s, address: e.target.value }))}
                          className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
                        />
                      ) : (
                        building.address || "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{roomCountByBuilding[building.id] ?? 0}</td>
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
                              onClick={() => startEditing(building)}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteBuilding(building.id)}
                              disabled={saving}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                            >
                              Delete
                            </button>
                            <Link
                              href={`/admin/rooms?organizationId=${organizationId}&buildingId=${building.id}`}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                            >
                              View rooms
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredBuildings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No buildings found for this organization.
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

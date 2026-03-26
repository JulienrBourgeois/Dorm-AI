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
      <div className={adminEmptyStateClass}>
        Go to{" "}
        <Link href="/home/dashboard" className="font-semibold underline">
          home
        </Link>{" "}
        and open an organization you admin so buildings stay scoped correctly.
      </div>
    );
  }

  return (
    <section className={adminPageSectionClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={adminPageTitleClass}>Buildings</h1>
          <p className={adminPageDescClass}>
            Organization-scoped building inventory with live create, edit, and delete actions.
          </p>
        </div>
      </div>

      <div className={adminCardClass}>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={createForm.name}
            onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="Building name"
            className={adminInputClass}
          />
          <input
            value={createForm.code}
            onChange={(e) => setCreateForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
            placeholder="Code (e.g. BERK)"
            className={adminInputClass}
          />
          <input
            value={createForm.address}
            onChange={(e) => setCreateForm((s) => ({ ...s, address: e.target.value }))}
            placeholder="Address (optional)"
            className={adminInputClass}
          />
          <button
            type="button"
            onClick={() => void handleCreateBuilding()}
            disabled={saving}
            className={`${adminPrimaryBtnCompactClass} w-full md:w-auto`}
          >
            + Create building
          </button>
        </div>
      </div>

      <div className={adminCardTableWrapClass}>
        <div className="border-b border-zinc-200 px-5 py-4 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
          Building inventory
        </div>
        <div className="p-4 sm:p-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, or address…"
            className={adminInputClass}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full border-collapse text-sm">
            <thead>
              <tr className={adminTableHeaderRowClass}>
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
                          className={`${adminInputTableClass} w-28`}
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
                          className={`${adminInputTableClass} w-full min-w-[8rem]`}
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
                          className={`${adminInputTableClass} w-full min-w-[8rem]`}
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
                              onClick={() => startEditing(building)}
                              className={adminSecondaryBtnClass}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteBuilding(building.id)}
                              disabled={saving}
                              className={adminSecondaryBtnClass}
                            >
                              Delete
                            </button>
                            <Link
                              href={`/admin/rooms?organizationId=${organizationId}&buildingId=${building.id}`}
                              className={adminSecondaryBtnClass}
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

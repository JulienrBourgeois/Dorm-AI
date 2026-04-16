"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, deleteField, doc, where, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/app/lib/firebase/app";
import { parseBuildingsCsv } from "@/lib/csv/parseBuildingsCsv";
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

type LeafletModule = typeof import("leaflet");
type BuildingForm = {
  name: string;
  code: string;
  address: string;
  latitude: string;
  longitude: string;
};

const EMPTY_FORM: BuildingForm = {
  name: "",
  code: "",
  address: "",
  latitude: "",
  longitude: "",
};

const BUILDINGS_CSV_TEMPLATE = `code,name,address,latitude,longitude
BERK,Berkeley Hall,123 Campus Drive,37.8721,-122.2578
`;

const CSV_IMPORT_BATCH_SIZE = 500;
const CSV_IMPORT_CONCURRENCY = 3;
const SUCCESS_CHIP_DISPLAY_LIMIT = 100;
const DEFAULT_MAP_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_MAP_ZOOM = 4;

type CsvImportProgress = {
  stage: "reading" | "writing";
  fileName: string;
  total: number;
  completed: number;
  skippedExisting: number;
  issues: number;
};

function hasCoordinates(
  building: WithId<Building> | Building | null | undefined,
): building is (WithId<Building> | Building) & { latitude: number; longitude: number } {
  return (
    !!building &&
    typeof building.latitude === "number" &&
    Number.isFinite(building.latitude) &&
    typeof building.longitude === "number" &&
    Number.isFinite(building.longitude)
  );
}

function formatCoordinates(building: WithId<Building>): string {
  if (!hasCoordinates(building)) return "Missing location";
  return `${building.latitude.toFixed(5)}, ${building.longitude.toFixed(5)}`;
}

function parseCoordinatesPair(
  latitudeText: string,
  longitudeText: string,
): { latitude?: number; longitude?: number; error?: string } {
  const latRaw = latitudeText.trim();
  const lngRaw = longitudeText.trim();
  if (!latRaw && !lngRaw) return {};
  if (!latRaw || !lngRaw) {
    return { error: "Provide both latitude and longitude, or leave both empty." };
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: "Latitude and longitude must be valid numbers." };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: "Latitude must be between -90 and 90; longitude must be between -180 and 180." };
  }
  return { latitude: lat, longitude: lng };
}

function downloadCsvTemplate() {
  const blob = new Blob([BUILDINGS_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "buildings-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

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
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImportProgress, setCsvImportProgress] = useState<CsvImportProgress | null>(null);
  const [lastImportedBuildings, setLastImportedBuildings] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [placingLocationForBuildingId, setPlacingLocationForBuildingId] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const leafletModuleRef = useRef<LeafletModule | null>(null);
  const placingLocationRef = useRef<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [buildingsSnap, roomsSnap] = await Promise.all([
        queryCollection(COLLECTIONS.buildings, where("organizationId", "==", organizationId)),
        queryCollection(COLLECTIONS.rooms, where("organizationId", "==", organizationId)),
      ]);

      const nextBuildings: Array<WithId<Building>> = buildingsSnap.docs.map((item) => ({
        ...(item.data() as Building),
        id: item.id,
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

  useEffect(() => {
    placingLocationRef.current = placingLocationForBuildingId;
  }, [placingLocationForBuildingId]);

  useEffect(() => {
    if (buildings.length === 0) {
      if (selectedBuildingId) setSelectedBuildingId(null);
      if (placingLocationForBuildingId) setPlacingLocationForBuildingId(null);
      return;
    }

    if (!selectedBuildingId || !buildings.some((building) => building.id === selectedBuildingId)) {
      setSelectedBuildingId(buildings[0]!.id);
    }

    if (
      placingLocationForBuildingId &&
      !buildings.some((building) => building.id === placingLocationForBuildingId)
    ) {
      setPlacingLocationForBuildingId(null);
    }
  }, [buildings, placingLocationForBuildingId, selectedBuildingId]);

  const saveLocationFromMap = useCallback(
    async (buildingId: string, latitude: number, longitude: number) => {
      setSaving(true);
      try {
        await updateDocument(COLLECTIONS.buildings, buildingId, {
          latitude,
          longitude,
          updatedAt: dateToTimestamp(new Date()),
        });
        if (editingId === buildingId) {
          setEditForm((state) => ({
            ...state,
            latitude: String(latitude),
            longitude: String(longitude),
          }));
        }
        setPlacingLocationForBuildingId(null);
        toast.success("Building location saved.");
        await refreshData();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save building location.");
      } finally {
        setSaving(false);
      }
    },
    [editingId, refreshData],
  );

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (mapRef.current || !mapContainerRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !mapContainerRef.current) return;
      leafletModuleRef.current = L;
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      markerLayerRef.current = L.layerGroup().addTo(map);
      map.on("click", (event) => {
        const targetBuildingId = placingLocationRef.current;
        if (!targetBuildingId) return;
        void saveLocationFromMap(targetBuildingId, event.latlng.lat, event.latlng.lng);
      });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 0);
    };
    void init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = null;
      markerLayerRef.current = null;
      leafletModuleRef.current = null;
    };
  }, [saveLocationFromMap]);

  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    const markers: Array<import("leaflet").CircleMarker> = [];
    for (const building of buildings) {
      if (!hasCoordinates(building)) continue;
      const selected = building.id === selectedBuildingId;
      const marker = L.circleMarker([building.latitude, building.longitude], {
        radius: selected ? 9 : 7,
        color: selected ? "#0EA5E9" : "#111827",
        weight: 2,
        fillOpacity: 0.85,
      });
      marker.bindTooltip(building.code, { direction: "top" });
      marker.on("click", () => setSelectedBuildingId(building.id));
      marker.addTo(layer);
      markers.push(marker);
    }

    const selected = buildings.find((building) => building.id === selectedBuildingId);
    if (hasCoordinates(selected)) {
      map.setView([selected.latitude, selected.longitude], Math.max(map.getZoom(), 16));
      return;
    }
    if (markers.length === 0) {
      map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));
    map.fitBounds(bounds.pad(0.25), { maxZoom: 16 });
  }, [buildings, selectedBuildingId]);

  const filteredBuildings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return buildings;
    return buildings.filter((building) => {
      const haystack =
        `${building.code} ${building.name} ${building.address ?? ""} ${building.latitude ?? ""} ${building.longitude ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [buildings, search]);

  const existingBuildingCodes = useMemo(
    () => new Set(buildings.map((building) => building.code.trim().toUpperCase())),
    [buildings],
  );

  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === selectedBuildingId) ?? null,
    [buildings, selectedBuildingId],
  );

  const mappedBuildingsCount = useMemo(
    () => buildings.filter((building) => hasCoordinates(building)).length,
    [buildings],
  );

  function hasDuplicateBuildingCode(code: string, excludeId?: string): boolean {
    const normalized = code.trim().toUpperCase();
    return buildings.some(
      (building) =>
        building.id !== excludeId && building.code.trim().toUpperCase() === normalized,
    );
  }

  async function handleCreateBuilding() {
    if (!organizationId) return;
    const name = createForm.name.trim();
    const code = createForm.code.trim().toUpperCase();
    const address = createForm.address.trim();
    const coordinates = parseCoordinatesPair(createForm.latitude, createForm.longitude);
    if (!name || !code) {
      toast.error("Building name and code are required.");
      return;
    }
    if (coordinates.error) {
      toast.error(coordinates.error);
      return;
    }
    if (hasDuplicateBuildingCode(code)) {
      toast.error(`A building with code "${code}" already exists.`);
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
        ...(coordinates.latitude != null && coordinates.longitude != null
          ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
          : {}),
        createdAt: now,
        updatedAt: now,
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
    setSelectedBuildingId(building.id);
    setEditForm({
      name: building.name,
      code: building.code,
      address: building.address ?? "",
      latitude:
        building.latitude != null && !Number.isNaN(building.latitude) ? String(building.latitude) : "",
      longitude:
        building.longitude != null && !Number.isNaN(building.longitude) ? String(building.longitude) : "",
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const name = editForm.name.trim();
    const code = editForm.code.trim().toUpperCase();
    const address = editForm.address.trim();
    const coordinates = parseCoordinatesPair(editForm.latitude, editForm.longitude);
    if (!name || !code) {
      toast.error("Building name and code are required.");
      return;
    }
    if (coordinates.error) {
      toast.error(coordinates.error);
      return;
    }
    if (hasDuplicateBuildingCode(code, editingId)) {
      toast.error(`A building with code "${code}" already exists.`);
      return;
    }

    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.buildings, editingId, {
        name,
        code,
        address,
        ...(coordinates.latitude != null && coordinates.longitude != null
          ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
          : { latitude: deleteField(), longitude: deleteField() }),
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

  async function handleClearLocation(buildingId: string) {
    if (!confirm("Clear the saved coordinates for this building?")) return;
    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.buildings, buildingId, {
        latitude: deleteField(),
        longitude: deleteField(),
        updatedAt: dateToTimestamp(new Date()),
      });
      if (editingId === buildingId) {
        setEditForm((state) => ({ ...state, latitude: "", longitude: "" }));
      }
      setPlacingLocationForBuildingId(null);
      toast.success("Building location cleared.");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear building location.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCsvFileSelected(file: File) {
    if (!organizationId) return;
    setCsvImporting(true);
    setLastImportedBuildings([]);
    setCsvImportProgress({
      stage: "reading",
      fileName: file.name,
      total: 0,
      completed: 0,
      skippedExisting: 0,
      issues: 0,
    });
    const text = await file.text();
    const { rows, issues } = parseBuildingsCsv(text);

    if (rows.length === 0) {
      const first = issues[0];
      toast.error(first?.message ?? "No valid rows in CSV.");
      if (issues.length > 1) {
        toast.message(`${issues.length - 1} more issue(s) in CSV.`, { duration: 6000 });
      }
      setCsvImporting(false);
      setCsvImportProgress(null);
      if (csvInputRef.current) csvInputRef.current.value = "";
      return;
    }

    const seenCodes = new Set(existingBuildingCodes);
    const toCreate = rows.filter((row) => {
      if (seenCodes.has(row.code)) return false;
      seenCodes.add(row.code);
      return true;
    });
    const skippedExisting = rows.length - toCreate.length;

    if (toCreate.length === 0) {
      toast.error("All rows match buildings that already exist (same code).");
      setCsvImporting(false);
      setCsvImportProgress(null);
      if (csvInputRef.current) csvInputRef.current.value = "";
      return;
    }

    setCsvImportProgress({
      stage: "writing",
      fileName: file.name,
      total: toCreate.length,
      completed: 0,
      skippedExisting,
      issues: issues.length,
    });
    const now = dateToTimestamp(new Date());
    let created = 0;
    const successfulImports: Array<{ code: string; name: string }> = [];
    try {
      const buildingsCollection = collection(db, COLLECTIONS.buildings);
      const chunks: Array<Array<(typeof toCreate)[number]>> = [];
      for (let start = 0; start < toCreate.length; start += CSV_IMPORT_BATCH_SIZE) {
        chunks.push(toCreate.slice(start, start + CSV_IMPORT_BATCH_SIZE));
      }
      let nextChunk = 0;
      const workerCount = Math.min(CSV_IMPORT_CONCURRENCY, chunks.length);
      await Promise.all(
        Array.from({ length: workerCount }, async () => {
          while (true) {
            const chunkIndex = nextChunk;
            nextChunk += 1;
            if (chunkIndex >= chunks.length) return;
            const chunk = chunks[chunkIndex];
            const batch = writeBatch(db);
            for (const row of chunk) {
              const ref = doc(buildingsCollection);
              batch.set(ref, {
                organizationId,
                name: row.name,
                code: row.code,
                address: row.address,
                ...(row.latitude != null && row.longitude != null
                  ? { latitude: row.latitude, longitude: row.longitude }
                  : {}),
                createdAt: now,
                updatedAt: now,
              });
            }
            await batch.commit();
            successfulImports.push(...chunk.map((row) => ({ code: row.code, name: row.name })));
            created += chunk.length;
            setCsvImportProgress((prev) =>
              prev
                ? {
                    ...prev,
                    stage: "writing",
                    completed: created,
                  }
                : prev,
            );
          }
        }),
      );
      setLastImportedBuildings(successfulImports);

      const parts = [`Created ${created} building(s).`];
      if (skippedExisting > 0) parts.push(`${skippedExisting} skipped (code already exists).`);
      if (issues.length > 0) parts.push(`${issues.length} row(s) skipped (see issues).`);
      toast.success(parts.join(" "));

      if (issues.length > 0) {
        const preview = issues
          .slice(0, 5)
          .map((issue) => `Line ${issue.line}: ${issue.message}`)
          .join("\n");
        toast.message(preview + (issues.length > 5 ? "\n…" : ""), { duration: 8000 });
      }

      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk import failed.");
    } finally {
      setCsvImporting(false);
      setCsvImportProgress(null);
      if (csvInputRef.current) csvInputRef.current.value = "";
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
            Organization-scoped building inventory with latitude/longitude map placement.
          </p>
        </div>
      </div>

      <div className={`${adminCardClass} mb-6`}>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Building map</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Leaflet + OpenStreetMap is built in. Select a building and click &quot;Place location&quot;, then click the
          map. Buildings without coordinates remain visible below as missing location until you assign them.
        </p>
        {placingLocationForBuildingId ? (
          <p className="mt-2 rounded-md bg-accent/15 px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-100">
            Click on the map to set coordinates for{" "}
            <span className="font-semibold">
              {buildings.find((building) => building.id === placingLocationForBuildingId)?.code ?? "this building"}
            </span>
            .{" "}
            <button
              type="button"
              className="underline"
              onClick={() => setPlacingLocationForBuildingId(null)}
            >
              Cancel
            </button>
          </p>
        ) : null}
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div ref={mapContainerRef} className="h-[380px] w-full bg-zinc-100 dark:bg-zinc-900/40" />
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Selected building
            </p>
            {selectedBuilding ? (
              <>
                <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedBuilding.code} - {selectedBuilding.name}
                </p>
                <p
                  className={`mt-3 text-sm font-medium ${
                    hasCoordinates(selectedBuilding)
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {hasCoordinates(selectedBuilding) ? "Coordinates saved" : "Missing location"}
                </p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {formatCoordinates(selectedBuilding)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPlacingLocationForBuildingId(selectedBuilding.id)}
                    disabled={saving}
                    className={adminPrimaryBtnCompactClass}
                  >
                    Place location
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleClearLocation(selectedBuilding.id)}
                    disabled={!hasCoordinates(selectedBuilding) || saving}
                    className={adminSecondaryBtnClass}
                  >
                    Clear location
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Create or select a building to manage its location.
              </p>
            )}
            <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Coverage
              </p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                {mappedBuildingsCount} mapped, {buildings.length - mappedBuildingsCount} missing location
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={adminCardClass}>
        <div className="mb-4 border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Bulk CSV import</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            First row: <span className="font-mono">code,name,address,latitude,longitude</span>. Address and
            coordinates are optional, but latitude and longitude must be provided together when used.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={downloadCsvTemplate} className={adminSecondaryBtnClass}>
              Download template
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleCsvFileSelected(file);
              }}
            />
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              disabled={csvImporting || saving}
              className={adminPrimaryBtnCompactClass}
            >
              {csvImportProgress?.stage === "reading"
                ? "Reading CSV…"
                : csvImporting
                  ? `Importing ${csvImportProgress?.completed ?? 0}/${csvImportProgress?.total ?? 0}`
                  : "Upload CSV"}
            </button>
          </div>
          {csvImportProgress ? (
            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                <span className="min-w-0 truncate">
                  {csvImportProgress.stage === "reading"
                    ? `Reading ${csvImportProgress.fileName}…`
                    : `Importing ${csvImportProgress.fileName}`}
                </span>
                <span>
                  {csvImportProgress.stage === "reading"
                    ? "Preparing rows…"
                    : `${csvImportProgress.completed} / ${csvImportProgress.total} created`}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-300"
                  style={{
                    width:
                      csvImportProgress.stage === "reading"
                        ? "12%"
                        : `${Math.max(
                            6,
                            Math.round(
                              (csvImportProgress.completed / Math.max(csvImportProgress.total, 1)) * 100,
                            ),
                          )}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {csvImportProgress.skippedExisting > 0
                  ? `${csvImportProgress.skippedExisting} duplicate code(s) already existed and will be skipped. `
                  : ""}
                {csvImportProgress.issues > 0
                  ? `${csvImportProgress.issues} CSV issue(s) will be reported after import.`
                  : "Building codes are deduped against this organization before write."}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-6">
          <input
            value={createForm.name}
            onChange={(e) => setCreateForm((state) => ({ ...state, name: e.target.value }))}
            placeholder="Building name"
            className={adminInputClass}
          />
          <input
            value={createForm.code}
            onChange={(e) => setCreateForm((state) => ({ ...state, code: e.target.value.toUpperCase() }))}
            placeholder="Code (e.g. BERK)"
            className={adminInputClass}
          />
          <input
            value={createForm.address}
            onChange={(e) => setCreateForm((state) => ({ ...state, address: e.target.value }))}
            placeholder="Address (optional)"
            className={adminInputClass}
          />
          <input
            value={createForm.latitude}
            onChange={(e) => setCreateForm((state) => ({ ...state, latitude: e.target.value }))}
            placeholder="Latitude"
            className={adminInputClass}
          />
          <input
            value={createForm.longitude}
            onChange={(e) => setCreateForm((state) => ({ ...state, longitude: e.target.value }))}
            placeholder="Longitude"
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
        {lastImportedBuildings.length > 0 ? (
          <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              Successfully uploaded in last CSV import ({lastImportedBuildings.length})
            </p>
            <div className="mt-2 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {lastImportedBuildings.slice(0, SUCCESS_CHIP_DISPLAY_LIMIT).map((building) => (
                  <span
                    key={`${building.code}-${building.name}`}
                    className="rounded-full border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {building.code} - {building.name}
                  </span>
                ))}
                {lastImportedBuildings.length > SUCCESS_CHIP_DISPLAY_LIMIT ? (
                  <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    +{lastImportedBuildings.length - SUCCESS_CHIP_DISPLAY_LIMIT} more
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="p-4 sm:p-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, address, or coordinates…"
            className={adminInputClass}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1160px] w-full border-collapse text-sm">
            <thead>
              <tr className={adminTableHeaderRowClass}>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuildings.map((building) => {
                const isEditing = editingId === building.id;
                const isSelected = selectedBuildingId === building.id;
                return (
                  <tr
                    key={building.id}
                    className={`border-b border-zinc-100 dark:border-zinc-800 ${
                      !isEditing && isSelected ? "bg-accent/10 dark:bg-accent/15" : ""
                    } ${!isEditing ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (!isEditing) setSelectedBuildingId(building.id);
                    }}
                  >
                    <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {isEditing ? (
                        <input
                          value={editForm.code}
                          onChange={(e) =>
                            setEditForm((state) => ({ ...state, code: e.target.value.toUpperCase() }))
                          }
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
                          onChange={(e) => setEditForm((state) => ({ ...state, name: e.target.value }))}
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
                          onChange={(e) => setEditForm((state) => ({ ...state, address: e.target.value }))}
                          className={`${adminInputTableClass} w-full min-w-[8rem]`}
                        />
                      ) : (
                        building.address || "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {roomCountByBuilding[building.id] ?? 0}
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {isEditing ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <input
                            value={editForm.latitude}
                            onChange={(e) => setEditForm((state) => ({ ...state, latitude: e.target.value }))}
                            placeholder="Lat"
                            className={`${adminInputTableClass} w-28`}
                          />
                          <span className="text-zinc-400">,</span>
                          <input
                            value={editForm.longitude}
                            onChange={(e) => setEditForm((state) => ({ ...state, longitude: e.target.value }))}
                            placeholder="Lng"
                            className={`${adminInputTableClass} w-28`}
                          />
                        </div>
                      ) : hasCoordinates(building) ? (
                        formatCoordinates(building)
                      ) : (
                        <span className="font-medium text-amber-700 dark:text-amber-300">
                          Missing location
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleSaveEdit();
                              }}
                              disabled={saving}
                              className={adminPrimaryBtnCompactClass}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
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
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(building);
                              }}
                              className={adminSecondaryBtnClass}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBuildingId(building.id);
                                setPlacingLocationForBuildingId(building.id);
                              }}
                              disabled={saving}
                              className={adminSecondaryBtnClass}
                            >
                              Place location
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleClearLocation(building.id);
                              }}
                              disabled={!hasCoordinates(building) || saving}
                              className={adminSecondaryBtnClass}
                            >
                              Clear location
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteBuilding(building.id);
                              }}
                              disabled={saving}
                              className={adminSecondaryBtnClass}
                            >
                              Delete
                            </button>
                            <Link
                              href={`/admin/rooms?organizationId=${organizationId}&buildingId=${building.id}`}
                              className={adminSecondaryBtnClass}
                              onClick={(e) => e.stopPropagation()}
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
              {!loading && filteredBuildings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No buildings found for this organization.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

"use client";

import type { MouseEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, deleteField, doc, where, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/app/lib/firebase/app";
import { parseBuildingsCsv } from "@/lib/csv/parseBuildingsCsv";
import { mapPercentToPixelOffset, offsetToMapPercent } from "@/lib/map/propertyMapGeometry";
import { deleteFile, getDownloadUrl, uploadFile } from "@/app/lib/firebase/storage";
import {
  COLLECTIONS,
  addDocument,
  dateToTimestamp,
  deleteDocument,
  getDocumentData,
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
import type { Building, Organization, Room, WithId } from "@/types";

type BuildingForm = {
  name: string;
  code: string;
  address: string;
  mapPinX: string;
  mapPinY: string;
};

const EMPTY_FORM: BuildingForm = {
  name: "",
  code: "",
  address: "",
  mapPinX: "",
  mapPinY: "",
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function formatMapPin(building: WithId<Building>): string {
  if (building.mapPinX == null || building.mapPinY == null) return "—";
  return `${Math.round(building.mapPinX)}%, ${Math.round(building.mapPinY)}%`;
}

const BUILDINGS_CSV_TEMPLATE = `code,name,address
BERK,Berkeley Hall,123 Campus Drive
`;

const CSV_IMPORT_BATCH_SIZE = 500;
const CSV_IMPORT_CONCURRENCY = 3;
const SUCCESS_CHIP_DISPLAY_LIMIT = 100;

type CsvImportProgress = {
  stage: "reading" | "writing";
  fileName: string;
  total: number;
  completed: number;
  skippedExisting: number;
  issues: number;
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
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImportProgress, setCsvImportProgress] = useState<CsvImportProgress | null>(null);
  const [lastImportedBuildings, setLastImportedBuildings] = useState<Array<{ code: string; name: string }>>([]);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const mapFileInputRef = useRef<HTMLInputElement>(null);
  const mapImgRef = useRef<HTMLImageElement>(null);
  const [propertyMapStoragePath, setPropertyMapStoragePath] = useState<string | null>(null);
  const [propertyMapUrl, setPropertyMapUrl] = useState<string | null>(null);
  const [mapUploading, setMapUploading] = useState(false);
  const [mapLayoutVersion, setMapLayoutVersion] = useState(0);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [placingPinForBuildingId, setPlacingPinForBuildingId] = useState<string | null>(null);
  const [pinOverlay, setPinOverlay] = useState<
    Array<{ id: string; left: number; top: number; code: string; selected: boolean }>
  >([]);

  const refreshData = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [buildingsSnap, roomsSnap, orgRes] = await Promise.all([
        queryCollection(COLLECTIONS.buildings, where("organizationId", "==", organizationId)),
        queryCollection(COLLECTIONS.rooms, where("organizationId", "==", organizationId)),
        getDocumentData<Organization>(COLLECTIONS.organizations, organizationId),
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

      const mapPath = orgRes.data?.propertyMapStoragePath?.trim() ?? "";
      setPropertyMapStoragePath(mapPath || null);
      if (mapPath) {
        try {
          const url = await getDownloadUrl(mapPath);
          setPropertyMapUrl(url);
        } catch {
          setPropertyMapUrl(null);
          toast.error("Could not load property map image (check Storage rules).");
        }
      } else {
        setPropertyMapUrl(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load buildings.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const bumpMapLayout = useCallback(() => {
    setMapLayoutVersion((v) => v + 1);
  }, []);

  useLayoutEffect(() => {
    const img = mapImgRef.current;
    if (!img || !propertyMapUrl) {
      setPinOverlay([]);
      return;
    }
    const list: Array<{ id: string; left: number; top: number; code: string; selected: boolean }> = [];
    for (const b of buildings) {
      if (b.mapPinX == null || b.mapPinY == null) continue;
      const pos = mapPercentToPixelOffset(img, b.mapPinX, b.mapPinY);
      if (!pos) continue;
      list.push({
        id: b.id,
        left: pos.left,
        top: pos.top,
        code: b.code,
        selected: b.id === selectedBuildingId,
      });
    }
    setPinOverlay(list);
  }, [buildings, propertyMapUrl, selectedBuildingId, mapLayoutVersion]);

  useEffect(() => {
    const img = mapImgRef.current;
    if (!img || !propertyMapUrl) return;
    const ro = new ResizeObserver(() => bumpMapLayout());
    ro.observe(img);
    return () => ro.disconnect();
  }, [propertyMapUrl, bumpMapLayout]);

  const filteredBuildings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return buildings;
    return buildings.filter((b) => {
      const hay = `${b.code} ${b.name} ${b.address ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [buildings, search]);

  const existingBuildingCodes = useMemo(
    () => new Set(buildings.map((b) => b.code.trim().toUpperCase())),
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
    if (!name || !code) {
      toast.error("Building name and code are required.");
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
    setSelectedBuildingId(building.id);
    setEditForm({
      name: building.name,
      code: building.code,
      address: building.address ?? "",
      mapPinX:
        building.mapPinX != null && !Number.isNaN(building.mapPinX) ? String(building.mapPinX) : "",
      mapPinY:
        building.mapPinY != null && !Number.isNaN(building.mapPinY) ? String(building.mapPinY) : "",
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
    if (hasDuplicateBuildingCode(code, editingId)) {
      toast.error(`A building with code "${code}" already exists.`);
      return;
    }

    const pinXStr = editForm.mapPinX.trim();
    const pinYStr = editForm.mapPinY.trim();
    const pinPatch: Record<string, unknown> = {};
    if (pinXStr === "" && pinYStr === "") {
      pinPatch.mapPinX = deleteField();
      pinPatch.mapPinY = deleteField();
    } else if (pinXStr !== "" && pinYStr !== "") {
      const px = Number(pinXStr);
      const py = Number(pinYStr);
      if (Number.isNaN(px) || Number.isNaN(py) || px < 0 || px > 100 || py < 0 || py > 100) {
        toast.error("Map pin X and Y must be numbers from 0 to 100.");
        return;
      }
      pinPatch.mapPinX = px;
      pinPatch.mapPinY = py;
    } else {
      toast.error("Set both map pin X and Y, or leave both empty.");
      return;
    }

    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.buildings, editingId, {
        name,
        code,
        address,
        ...pinPatch,
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

  async function handlePropertyMapFile(file: File) {
    if (!organizationId) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG, WebP, etc.).");
      return;
    }
    setMapUploading(true);
    const path = `organizations/${organizationId}/property-map/${Date.now()}_${sanitizeFileName(file.name)}`;
    try {
      await uploadFile(path, file, { contentType: file.type });
      const prevPath = propertyMapStoragePath;
      await updateDocument(COLLECTIONS.organizations, organizationId, {
        propertyMapStoragePath: path,
        updatedAt: dateToTimestamp(new Date()),
      });
      if (prevPath && prevPath !== path) {
        try {
          await deleteFile(prevPath);
        } catch {
          /* ignore stale file cleanup failures */
        }
      }
      const url = await getDownloadUrl(path);
      setPropertyMapStoragePath(path);
      setPropertyMapUrl(url);
      toast.success("Property map uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload map.");
    } finally {
      setMapUploading(false);
      if (mapFileInputRef.current) mapFileInputRef.current.value = "";
    }
  }

  async function handleRemovePropertyMap() {
    if (!organizationId || !propertyMapStoragePath) return;
    if (!confirm("Remove the property map from this organization?")) return;
    setMapUploading(true);
    try {
      await updateDocument(COLLECTIONS.organizations, organizationId, {
        propertyMapStoragePath: deleteField(),
        updatedAt: dateToTimestamp(new Date()),
      });
      try {
        await deleteFile(propertyMapStoragePath);
      } catch {
        /* ignore */
      }
      setPropertyMapStoragePath(null);
      setPropertyMapUrl(null);
      setPlacingPinForBuildingId(null);
      toast.success("Property map removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove map.");
    } finally {
      setMapUploading(false);
    }
  }

  async function handleMapImageClick(e: MouseEvent<HTMLImageElement>) {
    if (!placingPinForBuildingId || !organizationId) return;
    const img = mapImgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const ox = e.clientX - rect.left;
    const oy = e.clientY - rect.top;
    const pct = offsetToMapPercent(img, ox, oy);
    if (!pct) {
      toast.error("Click inside the visible map area.");
      return;
    }
    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.buildings, placingPinForBuildingId, {
        mapPinX: pct.x,
        mapPinY: pct.y,
        updatedAt: dateToTimestamp(new Date()),
      });
      setPlacingPinForBuildingId(null);
      toast.success("Map pin saved.");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save pin.");
    } finally {
      setSaving(false);
    }
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
    const toCreate = rows.filter((r) => {
      if (seenCodes.has(r.code)) return false;
      seenCodes.add(r.code);
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
            const chunkIdx = nextChunk;
            nextChunk += 1;
            if (chunkIdx >= chunks.length) return;
            const chunk = chunks[chunkIdx];
            const batch = writeBatch(db);
            for (const row of chunk) {
              const ref = doc(buildingsCollection);
              batch.set(ref, {
                organizationId,
                name: row.name,
                code: row.code,
                address: row.address,
                createdAt: now,
                updatedAt: now,
              } satisfies Omit<Building, "createdAt" | "updatedAt"> & {
                createdAt: ReturnType<typeof dateToTimestamp>;
                updatedAt: ReturnType<typeof dateToTimestamp>;
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
          .map((i) => `Line ${i.line}: ${i.message}`)
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
            Organization-scoped building inventory with live create, edit, and delete actions.
          </p>
        </div>
      </div>

      <div className={`${adminCardClass} mb-6`}>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Property map</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Upload one site map for this organization. Select a building in the table to highlight its pin; use
          &quot;Place pin&quot; then click the map to set coordinates.
        </p>
        {placingPinForBuildingId && (
          <p className="mt-2 rounded-md bg-accent/15 px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-100">
            Click on the map image to place the pin for{" "}
            <span className="font-semibold">
              {buildings.find((b) => b.id === placingPinForBuildingId)?.code ?? "this building"}
            </span>
            .{" "}
            <button
              type="button"
              className="underline"
              onClick={() => setPlacingPinForBuildingId(null)}
            >
              Cancel
            </button>
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={mapFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handlePropertyMapFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => mapFileInputRef.current?.click()}
            disabled={mapUploading || saving}
            className={adminPrimaryBtnCompactClass}
          >
            {mapUploading ? "Uploading…" : propertyMapUrl ? "Replace map image" : "Upload map image"}
          </button>
          {propertyMapUrl && (
            <button
              type="button"
              onClick={() => void handleRemovePropertyMap()}
              disabled={mapUploading}
              className={adminSecondaryBtnClass}
            >
              Remove map
            </button>
          )}
        </div>
        <div className="mt-4">
          {propertyMapUrl ? (
            <div className="relative inline-block max-w-full rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={mapImgRef}
                src={propertyMapUrl}
                alt="Property map"
                className={`block max-h-[min(420px,70vh)] max-w-full object-contain ${
                  placingPinForBuildingId ? "cursor-crosshair" : "cursor-default"
                }`}
                onLoad={bumpMapLayout}
                onClick={(e) => void handleMapImageClick(e)}
              />
              <div className="pointer-events-none absolute inset-0">
                {pinOverlay.map((pin) => (
                  <div
                    key={pin.id}
                    className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
                    style={{ left: pin.left, top: pin.top }}
                  >
                    <span
                      className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold shadow ${
                        pin.selected
                          ? "bg-accent text-white ring-2 ring-white dark:ring-zinc-900"
                          : "bg-zinc-900/85 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      }`}
                    >
                      {pin.code}
                    </span>
                    <span
                      className={`mt-0.5 h-2 w-2 rotate-45 ${
                        pin.selected ? "bg-accent" : "bg-zinc-900 dark:bg-zinc-100"
                      }`}
                      aria-hidden
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">
              No map yet. Upload an image of your property to place building pins.
            </div>
          )}
        </div>
      </div>

      <div className={adminCardClass}>
        <div className="mb-4 border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Bulk CSV import</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            First row: <span className="font-mono">code,name,address</span> (address optional). Codes are uppercased;
            quotes supported for commas in fields.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className={adminSecondaryBtnClass}
            >
              Download template
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleCsvFileSelected(f);
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
                              (csvImportProgress.completed /
                                Math.max(csvImportProgress.total, 1)) *
                                100,
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
        {lastImportedBuildings.length > 0 ? (
          <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              Successfully uploaded in last CSV import ({lastImportedBuildings.length})
            </p>
            <div className="mt-2 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {lastImportedBuildings.slice(0, SUCCESS_CHIP_DISPLAY_LIMIT).map((b) => (
                  <span
                    key={`${b.code}-${b.name}`}
                    className="rounded-full border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {b.code} - {b.name}
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
            placeholder="Search by code, name, or address…"
            className={adminInputClass}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-sm">
            <thead>
              <tr className={adminTableHeaderRowClass}>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3">Map pin</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuildings.map((building) => {
                const isEditing = editingId === building.id;
                const rowSelected = selectedBuildingId === building.id;
                return (
                  <tr
                    key={building.id}
                    className={`border-b border-zinc-100 dark:border-zinc-800 ${
                      !isEditing && rowSelected ? "bg-accent/10 dark:bg-accent/15" : ""
                    } ${!isEditing ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (!isEditing) setSelectedBuildingId(building.id);
                    }}
                  >
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
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                      {isEditing ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <input
                            value={editForm.mapPinX}
                            onChange={(e) => setEditForm((s) => ({ ...s, mapPinX: e.target.value }))}
                            placeholder="X"
                            title="Map pin X % (0–100)"
                            className={`${adminInputTableClass} w-14`}
                          />
                          <span className="text-zinc-400">,</span>
                          <input
                            value={editForm.mapPinY}
                            onChange={(e) => setEditForm((s) => ({ ...s, mapPinY: e.target.value }))}
                            placeholder="Y"
                            title="Map pin Y % (0–100)"
                            className={`${adminInputTableClass} w-14`}
                          />
                          <span className="text-xs text-zinc-400">%</span>
                        </div>
                      ) : (
                        formatMapPin(building)
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
                                setPlacingPinForBuildingId(building.id);
                              }}
                              disabled={!propertyMapUrl || saving}
                              title={!propertyMapUrl ? "Upload a property map first" : undefined}
                              className={adminSecondaryBtnClass}
                            >
                              Place pin
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
              {!loading && filteredBuildings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
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

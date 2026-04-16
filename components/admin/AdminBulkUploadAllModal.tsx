"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { collection, doc, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/app/lib/firebase/app";
import { auth } from "@/app/lib/firebase/app";
import { parseBuildingsCsv } from "@/lib/csv/parseBuildingsCsv";
import { parseInspectorInviteCsv, parseTenantInviteCsv } from "@/lib/csv/parseInviteCsv";
import { createInspectorInvite, createTenantInvite } from "@/lib/admin/membershipInvites";
import { BulkInviteCsvCard } from "@/components/admin/BulkInviteCsvCard";
import {
  COLLECTIONS,
  dateToTimestamp,
} from "@/app/lib/firebase/firestore";
import {
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
} from "@/components/admin/adminConsolePrimitives";
import type { Building, Room, WithId } from "@/types";

const BUILDINGS_CSV_TEMPLATE = `code,name,address,latitude,longitude
BERK,Berkeley Hall,123 Campus Drive,37.8721,-122.2578
`;

const TENANT_CSV_TEMPLATE = `name,email,room
Jane Doe,jane@example.com,101A
`;

const INSPECTOR_CSV_TEMPLATE = `name,email,building
Alex Smith,alex@example.com,NH
`;

const CSV_IMPORT_BATCH_SIZE = 500;
const CSV_IMPORT_CONCURRENCY = 3;

type BuildingsImportProgress = {
  stage: "reading" | "writing";
  fileName: string;
  total: number;
  completed: number;
  skippedExisting: number;
  issues: number;
};

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminBulkUploadAllModal({
  organizationId,
  buildings,
  rooms,
  defaultOpen = false,
}: {
  organizationId: string;
  buildings: Array<WithId<Building>>;
  rooms: Array<WithId<Room>>;
  defaultOpen?: boolean;
}) {
  const dialogId = useId();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const existingBuildingCodes = useMemo(() => {
    return new Set(buildings.map((b) => b.code.trim().toUpperCase()));
  }, [buildings]);

  const [buildingImporting, setBuildingImporting] = useState(false);
  const [buildingProgress, setBuildingProgress] = useState<BuildingsImportProgress | null>(null);
  const buildingsFileInputRef = useRef<HTMLInputElement>(null);

  const onBuildingsFile = useCallback(
    async (file: File) => {
      if (!organizationId) return;
      setBuildingImporting(true);
      setBuildingProgress({
        stage: "reading",
        fileName: file.name,
        total: 0,
        completed: 0,
        skippedExisting: 0,
        issues: 0,
      });
      try {
        const text = await file.text();
        const { rows, issues } = parseBuildingsCsv(text);
        if (rows.length === 0) {
          const first = issues[0];
          toast.error(first?.message ?? "No valid rows in CSV.");
          if (issues.length > 1) {
            toast.message(`${issues.length - 1} more issue(s) in CSV.`, { duration: 6000 });
          }
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
          return;
        }

        setBuildingProgress({
          stage: "writing",
          fileName: file.name,
          total: toCreate.length,
          completed: 0,
          skippedExisting,
          issues: issues.length,
        });

        const now = dateToTimestamp(new Date());
        const buildingsCollection = collection(db, COLLECTIONS.buildings);
        const chunks: Array<Array<(typeof toCreate)[number]>> = [];
        for (let start = 0; start < toCreate.length; start += CSV_IMPORT_BATCH_SIZE) {
          chunks.push(toCreate.slice(start, start + CSV_IMPORT_BATCH_SIZE));
        }
        let nextChunk = 0;
        let created = 0;
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
                  ...(row.latitude != null && row.longitude != null
                    ? {
                        latitude: row.latitude,
                        longitude: row.longitude,
                      }
                    : {}),
                  createdAt: now,
                  updatedAt: now,
                });
              }
              await batch.commit();
              created += chunk.length;
              setBuildingProgress((prev) =>
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

        const parts = [`Created ${created} building(s).`];
        if (skippedExisting > 0) parts.push(`${skippedExisting} skipped (code already exists).`);
        if (issues.length > 0) parts.push(`${issues.length} row(s) skipped (see issues).`);
        toast.success(parts.join(" "));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Buildings import failed.");
      } finally {
        setBuildingImporting(false);
        setBuildingProgress(null);
        if (buildingsFileInputRef.current) buildingsFileInputRef.current.value = "";
      }
    },
    [existingBuildingCodes, organizationId],
  );

  const handleBulkTenantInvites = useCallback(
    async (parsed: ReturnType<typeof parseTenantInviteCsv>["rows"]) => {
      const failures: string[] = [];
      let ok = 0;
      let failed = 0;
      for (const row of parsed) {
        let roomId: string | undefined;
        if (row.roomNumber?.trim()) {
          const key = row.roomNumber.trim().toLowerCase();
          const match = rooms.find((r) => r.number.trim().toLowerCase() === key);
          if (!match) {
            failed++;
            failures.push(`${row.email}: no room "${row.roomNumber}" — check room numbers in Rooms.`);
            continue;
          }
          roomId = match.id;
        }
        try {
          await createTenantInvite({
            organizationId,
            name: row.name,
            email: row.email,
            roomId: roomId ?? null,
            currentUser: auth.currentUser,
          });
          ok++;
        } catch (e) {
          failed++;
          failures.push(`${row.email}: ${e instanceof Error ? e.message : "Failed to create invite."}`);
        }
      }
      return { ok, failed, failures };
    },
    [organizationId, rooms],
  );

  const handleBulkInspectorInvites = useCallback(
    async (parsed: ReturnType<typeof parseInspectorInviteCsv>["rows"]) => {
      const failures: string[] = [];
      let ok = 0;
      let failed = 0;
      const pending = [...parsed];
      const workerCount = Math.min(3, pending.length);
      await Promise.all(
        Array.from({ length: workerCount }, async () => {
          while (true) {
            const row = pending.shift();
            if (!row) return;
            let buildingId: string | undefined;
            if (row.buildingCode?.trim()) {
              const key = row.buildingCode.trim().toLowerCase();
              const match = buildings.find((b) => b.code.trim().toLowerCase() === key);
              if (!match) {
                failed++;
                failures.push(`${row.email}: no building "${row.buildingCode}" — use building code from Buildings.`);
                continue;
              }
              buildingId = match.id;
            }
            try {
              await createInspectorInvite({
                organizationId,
                name: row.name,
                email: row.email,
                buildingId: buildingId ?? null,
                currentUser: auth.currentUser,
              });
              ok++;
            } catch (e) {
              failed++;
              failures.push(`${row.email}: ${e instanceof Error ? e.message : "Failed to create invite."}`);
            }
          }
        }),
      );
      return { ok, failed, failures };
    },
    [organizationId, buildings],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center justify-center rounded-xl border-2 border-zinc-200 bg-white text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        Bulk upload
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${dialogId}-title`}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4 px-5 pt-5">
              <div className="min-w-0">
                <h2 id={`${dialogId}-title`} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Bulk upload
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Upload buildings plus invite tenants and inspectors. You can do one, two, or all three.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className={adminSecondaryBtnClass}>
                Close
              </button>
            </div>

            <div className="mt-5 flex-1 space-y-4 overflow-y-auto px-5 pb-5">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Buildings (create)</h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      CSV columns: <span className="font-mono">code,name,address,latitude,longitude</span> (address and coordinates optional).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadCsv("buildings-template.csv", BUILDINGS_CSV_TEMPLATE)}
                    className={`${adminSecondaryBtnClass} shrink-0 text-xs`}
                  >
                    Download template
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    ref={buildingsFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    disabled={buildingImporting}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void onBuildingsFile(f);
                    }}
                    className="max-w-md cursor-pointer rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:file:bg-zinc-700 dark:file:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => buildingsFileInputRef.current?.click()}
                    disabled={buildingImporting}
                    className={adminPrimaryBtnClass}
                  >
                    {buildingProgress?.stage === "reading"
                      ? "Reading CSV…"
                      : buildingImporting
                        ? `Importing ${buildingProgress?.completed ?? 0}/${buildingProgress?.total ?? 0}`
                        : "Upload CSV"}
                  </button>
                </div>

                {buildingProgress ? (
                  <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      <span className="min-w-0 truncate">
                        {buildingProgress.stage === "reading"
                          ? `Reading ${buildingProgress.fileName}…`
                          : `Importing ${buildingProgress.fileName}`}
                      </span>
                      <span>
                        {buildingProgress.stage === "reading"
                          ? "Preparing rows…"
                          : `${buildingProgress.completed} / ${buildingProgress.total} created`}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-accent transition-[width] duration-300"
                        style={{
                          width:
                            buildingProgress.stage === "reading"
                              ? "12%"
                              : `${Math.max(
                                  6,
                                  Math.round(
                                    (buildingProgress.completed / Math.max(buildingProgress.total, 1)) * 100,
                                  ),
                                )}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {buildingProgress.skippedExisting > 0
                        ? `${buildingProgress.skippedExisting} duplicate code(s) already existed and will be skipped. `
                        : ""}
                      {buildingProgress.issues > 0
                        ? `${buildingProgress.issues} CSV issue(s) will be reported after import.`
                        : "Building codes are deduped against this organization before write."}
                    </p>
                  </div>
                ) : null}
              </div>

              <BulkInviteCsvCard
                title="Tenants (invite)"
                summary='Upload columns name, email, and optional room (room number). Download the template to get the format right.'
                templateFilename="tenant-invites-template.csv"
                templateCsv={TENANT_CSV_TEMPLATE}
                parseCsv={parseTenantInviteCsv}
                previewHeaders={["Name", "Email", "Room"]}
                previewRow={(row) => [row.name, row.email, row.roomNumber ?? "—"]}
                onInviteAll={handleBulkTenantInvites}
              />

              <BulkInviteCsvCard
                title="Inspectors (invite)"
                summary='Upload columns name, email, and optional building (building code). Download the template to get the format right.'
                templateFilename="inspector-invites-template.csv"
                templateCsv={INSPECTOR_CSV_TEMPLATE}
                parseCsv={parseInspectorInviteCsv}
                previewHeaders={["Name", "Email", "Building"]}
                previewRow={(row) => [row.name, row.email, row.buildingCode ?? "—"]}
                onInviteAll={handleBulkInspectorInvites}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <button type="button" onClick={() => setOpen(false)} className={adminSecondaryBtnClass}>
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}


"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { where } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import { useSetInspectorExecutionActive } from "@/components/portals/InspectorRuntimeContext";
import { inspectorPortalHref } from "@/lib/portal/portalOrgNavigation";
import { getDownloadUrl, uploadFile } from "@/app/lib/firebase/storage";
import {
  COLLECTIONS,
  dateToTimestamp,
  getDocumentData,
  queryCollection,
  setDocument,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import type {
  Inspection,
  InspectionItem,
  InspectionItemResponse,
  InspectionStatus,
  Media,
  Room,
  User,
  WithId,
} from "@/types";

type RunnerView = "queue" | "execution" | "review";
type ExecutionMode = "edit" | "view";

type ChecklistSection = {
  id: string;
  title: string;
  items: string[];
};

type InspectionRecord = WithId<Inspection> & {
  roomNumber?: string;
  inspectorName?: string;
};

type InspectionItemRecord = WithId<InspectionItem>;

const CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: "safety",
    title: "Safety",
    items: [
      "Smoke detector functional",
      "Fire extinguisher present (if required)",
      "Clear and accessible exits",
      "No fire hazards (blocked vents, overloaded outlets)",
    ],
  },
  {
    id: "appliances",
    title: "Appliances",
    items: [
      "Refrigerator functioning properly",
      "Freezer functioning properly",
      "Stove/oven working",
      "All knobs and handles present",
      "Microwave functioning (if applicable)",
    ],
  },
  {
    id: "electrical",
    title: "Electrical & Lighting",
    items: [
      "All lights functioning",
      "Light switches working",
      "Outlets working",
      "No exposed wiring",
      "No unsafe extension cord usage",
    ],
  },
  {
    id: "general",
    title: "General",
    items: [
      "Furniture intact and stable",
      "Room is reasonably clean",
      "Trash disposed properly",
      "No unauthorized items present",
      "No strong or unusual odors",
    ],
  },
  {
    id: "walls",
    title: "Walls / Floors / Ceilings",
    items: [
      "Walls free of holes or major damage",
      "No peeling paint or markings",
      "Ceiling intact (no cracks or water stains)",
      "Floor in good condition (no major stains/damage)",
      "Baseboards intact",
    ],
  },
  {
    id: "windows_doors",
    title: "Windows & Doors",
    items: [
      "Windows open and close properly",
      "Window locks functioning",
      "Screens intact",
      "Door opens/closes properly",
      "Door locks securely",
    ],
  },
  {
    id: "plumbing",
    title: "Plumbing",
    items: [
      "Sink functioning properly",
      "Adequate water pressure",
      "Drain works (no clogging)",
      "No leaks present",
      "Toilet/shower functioning (if applicable)",
    ],
  },
  {
    id: "hvac",
    title: "HVAC",
    items: [
      "Thermostat functioning",
      "Heating/cooling working",
      "Airflow adequate",
      "No unusual noises",
    ],
  },
  {
    id: "pest",
    title: "Pest Control",
    items: [
      "No signs of insects",
      "No signs of rodents",
      "Food stored properly",
    ],
  },
];

function statusPillClass(status: InspectionStatus) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
  if (status === "IN_PROGRESS") return "bg-accent/10 text-accent";
  if (status === "CANCELED") return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
  return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
}

function toReadableDate(value: unknown) {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  return String(value);
}

function itemDocId(inspectionId: string, sectionId: string, idx: number) {
  return `${inspectionId}_${sectionId}_${idx}`;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function InspectorExecutionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const setExecutionActive = useSetInspectorExecutionActive();
  const [view, setView] = useState<RunnerView>("queue");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [inspectorName, setInspectorName] = useState<string>("");
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("edit");
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [responseMap, setResponseMap] = useState<Record<string, InspectionItemResponse | undefined>>({});
  const [notes, setNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingMediaRows, setExistingMediaRows] = useState<Array<{ id: string; downloadUrl: string; createdAt?: unknown }>>([]);
  const [lastReviewMessage, setLastReviewMessage] = useState("");

  const activeInspection = useMemo(
    () => inspections.find((i) => i.id === activeInspectionId) ?? null,
    [inspections, activeInspectionId],
  );
  const queueInspections = useMemo(
    () =>
      inspections.filter(
        (inspection) =>
          inspection.status === "SCHEDULED" || inspection.status === "IN_PROGRESS",
      ),
    [inspections],
  );
  const reviewInspections = useMemo(
    () => inspections.filter((inspection) => inspection.status === "COMPLETED"),
    [inspections],
  );

  const activeSection = CHECKLIST_TEMPLATE[activeSectionIdx] ?? null;
  // Progress is based on section navigation (Next section), not checkbox count.
  const completedSectionCount = Math.min(activeSectionIdx, CHECKLIST_TEMPLATE.length);
  const progressPct = CHECKLIST_TEMPLATE.length
    ? Math.round((completedSectionCount / CHECKLIST_TEMPLATE.length) * 100)
    : 0;

  const RESPONSE_OPTIONS: Array<{ value: Extract<InspectionItemResponse, "GOOD" | "DAMAGED">; label: string }> = [
    { value: "GOOD", label: "Good" },
    { value: "DAMAGED", label: "Damaged" },
  ];

  function keyFor(sectionId: string, idx: number) {
    return `${sectionId}:${idx}`;
  }

  const loadInspections = useCallback(
    async (uid: string, orgId: string) => {
      setLoading(true);
      try {
        const inspectionQuery = orgId
          ? queryCollection(
              COLLECTIONS.inspections,
              where("inspectorId", "==", uid),
              where("organizationId", "==", orgId),
            )
          : queryCollection(COLLECTIONS.inspections, where("inspectorId", "==", uid));
        const [inspectionSnap, userDoc] = await Promise.all([
          inspectionQuery,
          getDocumentData<User>(COLLECTIONS.users, uid),
        ]);

        setInspectorName(userDoc.data?.name || "Inspector");

        const rows: InspectionRecord[] = [];
        for (const doc of inspectionSnap.docs) {
          const inspection = doc.data() as Inspection;
          const room = await getDocumentData<Room>(COLLECTIONS.rooms, inspection.roomId);
          rows.push({
            ...inspection,
            id: doc.id,
            roomNumber: room.data?.number || inspection.roomLabel,
            inspectorName: userDoc.data?.name || "Inspector",
          });
        }
        rows.sort((a, b) => String(a.scheduledFor).localeCompare(String(b.scheduledFor)));
        setInspections(rows);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load inspections.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  function replaceInspectorUrl(nextView: "queue" | "review") {
    router.replace(inspectorPortalHref(organizationId, nextView), { scroll: false });
  }

  const hydrateRunnerFromInspectionItems = useCallback(async (inspectionId: string) => {
    const itemSnap = await queryCollection(COLLECTIONS.inspectionItems, where("inspectionId", "==", inspectionId));
    const itemRows = itemSnap.docs.map((doc) => ({ ...(doc.data() as InspectionItem), id: doc.id })) as InspectionItemRecord[];
    const nextResponses: Record<string, InspectionItemResponse | undefined> = {};
    let note = "";
    for (const row of itemRows) {
      const section = row.section;
      const sectionTemplate = CHECKLIST_TEMPLATE.find((s) => s.id === section);
      if (!sectionTemplate) continue;
      const promptIdx = sectionTemplate.items.findIndex((item) => item === row.prompt);
      if (promptIdx >= 0) {
        nextResponses[keyFor(section, promptIdx)] = row.response;
      }
      if (!note && row.notes) note = row.notes;
    }
    setResponseMap(nextResponses);
    setNotes(note);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsub = subscribeToAuthState(async (user) => {
      if (!user) return;
      if (!cancelled) setUserId(user.uid);
      try {
        await loadInspections(user.uid, organizationId);
      } catch {
        // Ignore auth-transition race errors while signing out/navigation changes.
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [loadInspections, organizationId]);

  useEffect(() => {
    setActiveInspectionId(null);
    setView("queue");
  }, [organizationId]);

  useEffect(() => {
    const raw = searchParams.get("view");
    if (raw === "settings") {
      router.replace(inspectorPortalHref(organizationId, "queue"), { scroll: false });
      setView("queue");
      setActiveInspectionId(null);
      return;
    }
    if (raw === "review") {
      if (activeInspectionId && executionMode === "view") {
        setView("execution");
        return;
      }
      setView("review");
      setActiveInspectionId(null);
      return;
    }
    setView((prev) => (prev === "execution" ? prev : "queue"));
    if (raw === "queue" || raw === null) {
      setActiveInspectionId(null);
    }
  }, [activeInspectionId, executionMode, organizationId, router, searchParams]);

  useEffect(() => {
    if (!setExecutionActive) return;
    setExecutionActive(view === "execution");
  }, [view, setExecutionActive]);

  async function startOrResumeInspection(inspection: InspectionRecord, mode: ExecutionMode = "edit") {
    try {
      setSaving(true);
      if (mode === "edit" && inspection.status === "SCHEDULED") {
        await updateDocument(COLLECTIONS.inspections, inspection.id, {
          status: "IN_PROGRESS",
          startedAt: dateToTimestamp(new Date()),
          updatedAt: dateToTimestamp(new Date()),
        });
      }
      if (mode === "edit" && inspection.status === "COMPLETED") {
        await updateDocument(COLLECTIONS.inspections, inspection.id, {
          status: "IN_PROGRESS",
          updatedAt: dateToTimestamp(new Date()),
        });
      }
      setActiveInspectionId(inspection.id);
      setExecutionMode(mode);
      setActiveSectionIdx(0);
      if (mode === "view") {
        replaceInspectorUrl("review");
      }
      setView("execution");
      await hydrateRunnerFromInspectionItems(inspection.id);
      const mediaSnap = await queryCollection(COLLECTIONS.media, where("inspectionId", "==", inspection.id));
      const mediaRows: Array<{ id: string; downloadUrl: string; createdAt?: unknown }> = [];
      for (const doc of mediaSnap.docs) {
        const media = doc.data() as Media;
        try {
          const downloadUrl = await getDownloadUrl(media.storagePath);
          mediaRows.push({ id: doc.id, downloadUrl, createdAt: media.createdAt });
        } catch {
          // Ignore missing/unreadable files in view gallery.
        }
      }
      setExistingMediaRows(mediaRows);
      setSelectedFiles([]);
      await loadInspections(userId, organizationId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start inspection.");
    } finally {
      setSaving(false);
    }
  }

  async function persistChecklistItems(markCompleted: boolean) {
    if (!activeInspection) return;
    const now = dateToTimestamp(new Date());
    for (const section of CHECKLIST_TEMPLATE) {
      for (let idx = 0; idx < section.items.length; idx += 1) {
        const key = keyFor(section.id, idx);
        const response = responseMap[key] ?? "NA";
        await setDocument(
          COLLECTIONS.inspectionItems,
          itemDocId(activeInspection.id, section.id, idx),
          {
            inspectionId: activeInspection.id,
            section: section.id,
            prompt: section.items[idx],
            response,
            notes: notes.trim() || "",
            updatedAt: now,
            ...(markCompleted ? { createdAt: now } : {}),
          },
          { merge: true },
        );
      }
    }
  }

  async function persistMediaUploads() {
    if (!activeInspection || selectedFiles.length === 0) return;
    const now = dateToTimestamp(new Date());
    const section = activeSection ?? CHECKLIST_TEMPLATE[0];
    const firstCheckedIdx = section.items.findIndex((_, idx) => {
      const response = responseMap[keyFor(section.id, idx)];
      return response === "GOOD" || response === "DAMAGED";
    });
    const inspectionItemId =
      firstCheckedIdx >= 0
        ? itemDocId(activeInspection.id, section.id, firstCheckedIdx)
        : itemDocId(activeInspection.id, section.id, 0);

    for (const file of selectedFiles) {
      const safeName = sanitizeFileName(file.name);
      const storagePath = `inspections/${activeInspection.organizationId}/${activeInspection.id}/${Date.now()}_${safeName}`;
      await uploadFile(storagePath, file, {
        contentType: file.type || undefined,
        customMetadata: {
          inspectionId: activeInspection.id,
          sectionId: section.id,
          uploadedBy: userId,
        },
      });

      const mediaId = `${activeInspection.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await setDocument(COLLECTIONS.media, mediaId, {
        inspectionId: activeInspection.id,
        inspectionItemId,
        type: "PHOTO",
        storagePath,
        uploadedBy: userId,
        fileName: file.name,
        sizeBytes: file.size,
        createdAt: now,
      });
    }

    setSelectedFiles([]);
  }

  async function handleSaveProgress() {
    if (!activeInspection) return;
    try {
      setSaving(true);
      await persistChecklistItems(false);
      await persistMediaUploads();
      await updateDocument(COLLECTIONS.inspections, activeInspection.id, {
        status: "IN_PROGRESS",
        updatedAt: dateToTimestamp(new Date()),
      });
      toast.success("Progress saved.");
      await loadInspections(userId, organizationId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save progress.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinishInspection() {
    if (!activeInspection) return;
    try {
      setSaving(true);
      await persistChecklistItems(true);
      await persistMediaUploads();
      await updateDocument(COLLECTIONS.inspections, activeInspection.id, {
        status: "COMPLETED",
        completedAt: dateToTimestamp(new Date()),
        updatedAt: dateToTimestamp(new Date()),
      });
      setLastReviewMessage(`Inspection ${activeInspection.id} submitted at ${new Date().toLocaleString()}.`);
      setActiveInspectionId(null);
      setResponseMap({});
      setNotes("");
      setView("review");
      replaceInspectorUrl("review");
      toast.success("Inspection completed.");
      await loadInspections(userId, organizationId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete inspection.");
    } finally {
      setSaving(false);
    }
  }

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(files);
  }

  return (
    <>
        {view === "queue" && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Assigned inspections</h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{queueInspections.length} active</span>
            </div>
            <div className="mt-4 space-y-3">
              {queueInspections.map((insp) => (
                <div key={insp.id} className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{insp.roomNumber || insp.roomLabel}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Scheduled: {toReadableDate(insp.scheduledFor)}</div>
                    <div className="mt-1">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(insp.status)}`}>{insp.status}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void startOrResumeInspection(insp, "edit")}
                    disabled={saving || insp.status === "CANCELED"}
                    className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-alt disabled:opacity-60"
                  >
                    {insp.status === "IN_PROGRESS" ? "Resume" : "Start"}
                  </button>
                </div>
              ))}
              {loading && <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading inspections...</div>}
              {!loading && queueInspections.length === 0 && <div className="text-sm text-zinc-500 dark:text-zinc-400">No active inspections right now.</div>}
            </div>
          </section>
        )}

        {view === "execution" && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            {!activeInspection ? (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Select an inspection from queue first.</div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {activeInspection.roomNumber || activeInspection.roomLabel}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Progress: {progressPct}%</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(activeInspection.status)}`}>
                    {activeInspection.status}
                  </span>
                </div>

                <div className="mt-4 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${progressPct}%` }} />
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{activeSection?.title}</h3>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Section {activeSectionIdx + 1} of {CHECKLIST_TEMPLATE.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {activeSection?.items.map((label, idx) => {
                      const key = keyFor(activeSection.id, idx);
                      const selectedResponse = responseMap[key];
                      return (
                        <div
                          key={key}
                          className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                        >
                          <div className="text-sm text-zinc-800 dark:text-zinc-100">{label}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {RESPONSE_OPTIONS.map((option) => {
                              const isSelected = selectedResponse === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  disabled={executionMode === "view"}
                                  onClick={() =>
                                    setResponseMap((prev) => ({
                                      ...prev,
                                      [key]: prev[key] === option.value ? undefined : option.value,
                                    }))
                                  }
                                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                                    isSelected
                                      ? "border-accent bg-accent/15 text-accent"
                                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Inspector notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      if (executionMode === "view") return;
                      setNotes(e.target.value);
                    }}
                    readOnly={executionMode === "view"}
                    className="mt-2 min-h-[100px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
                    placeholder="Add notes for this inspection..."
                  />
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Evidence uploads</label>
                  {executionMode === "edit" ? (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-zinc-200">
                        <span>Attach photos</span>
                        <input type="file" multiple accept="image/*" onChange={handleFilesChange} className="hidden" />
                      </label>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {selectedFiles.length === 0 ? "No files selected" : `${selectedFiles.length} file(s) ready to upload on save/finish`}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      View mode: uploads are disabled.
                    </p>
                  )}
                  {existingMediaRows.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {existingMediaRows.map((media) => (
                        <a
                          key={media.id}
                          href={media.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={media.downloadUrl}
                            alt="Uploaded inspection evidence"
                            className="block max-h-40 w-full object-contain"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      No uploaded photos yet.
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSectionIdx((i) => Math.max(i - 1, 0))}
                    disabled={activeSectionIdx === 0}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Prev
                  </button>
                  {activeSectionIdx < CHECKLIST_TEMPLATE.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveSectionIdx((i) => Math.min(i + 1, CHECKLIST_TEMPLATE.length - 1))}
                      className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-alt"
                    >
                      Next section
                    </button>
                  ) : (
                    <>
                      {executionMode === "edit" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleSaveProgress()}
                            disabled={saving}
                            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                          >
                            Save progress
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleFinishInspection()}
                            disabled={saving}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Finish inspection
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveInspectionId(null);
                            setView("review");
                            replaceInspectorUrl("review");
                          }}
                          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                        >
                          Back to review
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {view === "review" && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Completed inspections</h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{reviewInspections.length} submitted</span>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {lastReviewMessage || "Select an inspection below to edit your submitted answers."}
            </p>
            <div className="mt-4 space-y-3">
              {reviewInspections.map((insp) => (
                <div key={insp.id} className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{insp.roomNumber || insp.roomLabel}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Completed: {toReadableDate(insp.completedAt)}
                    </div>
                    <div className="mt-1">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(insp.status)}`}>{insp.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void startOrResumeInspection(insp, "view")}
                      disabled={saving}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => void startOrResumeInspection(insp, "edit")}
                      disabled={saving}
                      className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-alt disabled:opacity-60"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
              {!loading && reviewInspections.length === 0 && (
                <div className="text-sm text-zinc-500 dark:text-zinc-400">No completed inspections yet.</div>
              )}
            </div>
          </section>
        )}

    </>
  );
}

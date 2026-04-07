"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { where } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import { useSetInspectorExecutionActive } from "@/components/portals/InspectorRuntimeContext";
import { inspectorPortalHref } from "@/lib/portal/portalOrgNavigation";
import { uploadFile } from "@/app/lib/firebase/storage";
import {
  COLLECTIONS,
  dateToTimestamp,
  getDocumentData,
  queryCollection,
  setDocument,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import type { Inspection, InspectionItem, InspectionStatus, Room, User, WithId } from "@/types";

type RunnerView = "queue" | "execution" | "review";

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
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [lastReviewMessage, setLastReviewMessage] = useState("");

  const activeInspection = useMemo(
    () => inspections.find((i) => i.id === activeInspectionId) ?? null,
    [inspections, activeInspectionId],
  );

  const activeSection = CHECKLIST_TEMPLATE[activeSectionIdx] ?? null;
  // Progress is based on section navigation (Next section), not checkbox count.
  const completedSectionCount = Math.min(activeSectionIdx, CHECKLIST_TEMPLATE.length);
  const progressPct = CHECKLIST_TEMPLATE.length
    ? Math.round((completedSectionCount / CHECKLIST_TEMPLATE.length) * 100)
    : 0;

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
    const nextChecked: Record<string, boolean> = {};
    let note = "";
    for (const row of itemRows) {
      const section = row.section;
      const sectionTemplate = CHECKLIST_TEMPLATE.find((s) => s.id === section);
      if (!sectionTemplate) continue;
      const promptIdx = sectionTemplate.items.findIndex((item) => item === row.prompt);
      if (promptIdx >= 0) {
        nextChecked[`${section}:${promptIdx}`] = row.response !== "NA";
      }
      if (!note && row.notes) note = row.notes;
    }
    setCheckedMap(nextChecked);
    setNotes(note);
  }, []);

  useEffect(() => {
    const unsub = subscribeToAuthState(async (user) => {
      if (!user) return;
      setUserId(user.uid);
      await loadInspections(user.uid, organizationId);
    });
    return unsub;
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
      setView("review");
      setActiveInspectionId(null);
      return;
    }
    setView((prev) => (prev === "execution" ? prev : "queue"));
    if (raw === "queue" || raw === null) {
      setActiveInspectionId(null);
    }
  }, [organizationId, router, searchParams]);

  useEffect(() => {
    if (!setExecutionActive) return;
    setExecutionActive(view === "execution");
  }, [view, setExecutionActive]);

  async function startOrResumeInspection(inspection: InspectionRecord) {
    try {
      setSaving(true);
      if (inspection.status === "SCHEDULED") {
        await updateDocument(COLLECTIONS.inspections, inspection.id, {
          status: "IN_PROGRESS",
          startedAt: dateToTimestamp(new Date()),
          updatedAt: dateToTimestamp(new Date()),
        });
      }
      setActiveInspectionId(inspection.id);
      setActiveSectionIdx(0);
      setView("execution");
      await hydrateRunnerFromInspectionItems(inspection.id);
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
        const key = `${section.id}:${idx}`;
        const checked = Boolean(checkedMap[key]);
        await setDocument(
          COLLECTIONS.inspectionItems,
          itemDocId(activeInspection.id, section.id, idx),
          {
            inspectionId: activeInspection.id,
            section: section.id,
            prompt: section.items[idx],
            response: checked ? "GOOD" : "NA",
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
    const firstCheckedIdx = section.items.findIndex((_, idx) => checkedMap[`${section.id}:${idx}`]);
    const inspectionItemId = firstCheckedIdx >= 0 ? itemDocId(activeInspection.id, section.id, firstCheckedIdx) : undefined;

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
      setCheckedMap({});
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
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{inspections.length} total</span>
            </div>
            <div className="mt-4 space-y-3">
              {inspections.map((insp) => (
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
                    onClick={() => void startOrResumeInspection(insp)}
                    disabled={saving || insp.status === "COMPLETED" || insp.status === "CANCELED"}
                    className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-alt disabled:opacity-60"
                  >
                    {insp.status === "IN_PROGRESS" ? "Resume" : "Start"}
                  </button>
                </div>
              ))}
              {loading && <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading inspections...</div>}
              {!loading && inspections.length === 0 && <div className="text-sm text-zinc-500 dark:text-zinc-400">No assigned inspections right now.</div>}
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
                      const key = `${activeSection.id}:${idx}`;
                      return (
                        <label
                          key={key}
                          className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(checkedMap[key])}
                            onChange={() => setCheckedMap((prev) => ({ ...prev, [key]: !prev[key] }))}
                            className="h-4 w-4 accent-[#0ea5e9]"
                          />
                          <span className="text-sm text-zinc-800 dark:text-zinc-100">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Inspector notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2 min-h-[100px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
                    placeholder="Add notes for this inspection..."
                  />
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Evidence uploads</label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-zinc-200">
                      <span>Attach photos</span>
                      <input type="file" multiple accept="image/*" onChange={handleFilesChange} className="hidden" />
                    </label>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {selectedFiles.length === 0 ? "No files selected" : `${selectedFiles.length} file(s) ready to upload on save/finish`}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
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
                    <button
                      type="button"
                      onClick={() => void handleFinishInspection()}
                      disabled={saving}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Finish inspection
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {view === "review" && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Latest submission</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {lastReviewMessage || "No recent submission in this session. Completed inspections are persisted to Firestore."}
            </p>
          </section>
        )}

    </>
  );
}

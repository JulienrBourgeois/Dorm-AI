"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { BackLink } from "@/components/auth/ui";
import {
  adminInputClass,
  adminPageDescClass,
  adminPageSectionClass,
  adminPageTitleClass,
  adminPrimaryBtnCompactClass,
  adminSecondaryBtnClass,
  adminTextareaClass,
} from "@/components/admin/adminConsolePrimitives";
import { toast } from "sonner";
import {
  COLLECTIONS,
  dateToTimestamp,
  getDocumentData,
  queryCollection,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import { getDownloadUrl } from "@/app/lib/firebase/storage";
import { where } from "firebase/firestore";
import type {
  Inspection,
  InspectionStatus,
  InspectionSummaryStatus,
  InspectionItem,
  Media,
  Room,
  User,
} from "@/types";

type TransitionMap = Record<InspectionStatus, InspectionStatus[]>;

const ALLOWED_TRANSITIONS: TransitionMap = {
  SCHEDULED: ["IN_PROGRESS", "CANCELED"],
  IN_PROGRESS: ["COMPLETED", "CANCELED"],
  COMPLETED: [],
  CANCELED: ["SCHEDULED"],
};

function formatDate(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  return String(value);
}

function toDateInputValue(value: unknown): string {
  if (!value) return "";
  let date: Date | null = null;
  if (value instanceof Date) date = value;
  else if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    date = (value as { toDate: () => Date }).toDate();
  }
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function InspectionDetailClient({ inspectionId }: { inspectionId: string }) {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inspection, setInspection] = useState<(Inspection & { id: string }) | null>(null);
  const [inspectorName, setInspectorName] = useState("—");
  const [roomNumber, setRoomNumber] = useState("—");
  const [tenantNames, setTenantNames] = useState<string[]>([]);
  const [scheduledAtInput, setScheduledAtInput] = useState("");
  const [mediaItems, setMediaItems] = useState<Array<{ id: string; storagePath: string; downloadUrl: string; uploadedBy: string }>>([]);
  const [summaryDraft, setSummaryDraft] = useState("");
  const [summarySaving, setSummarySaving] = useState(false);
  const [itemRows, setItemRows] = useState<Array<{ id: string; data: InspectionItem }>>([]);
  const sharedInspectionNote =
    itemRows.find((item) => Boolean(item.data.notes && item.data.notes.trim()))?.data.notes?.trim() || "";
  const groupedItems = itemRows.reduce<Record<string, Array<{ id: string; data: InspectionItem }>>>((acc, item) => {
    if (!acc[item.data.section]) acc[item.data.section] = [];
    acc[item.data.section].push(item);
    return acc;
  }, {});
  const groupedSections = Object.entries(groupedItems);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getDocumentData<Inspection>(COLLECTIONS.inspections, inspectionId);
      if (!data) {
        toast.error("Inspection not found.");
        setInspection(null);
        setLoading(false);
        return;
      }
      if (organizationId && data.organizationId !== organizationId) {
        toast.error("Inspection does not belong to the selected organization.");
        setInspection(null);
        setLoading(false);
        return;
      }

      setInspection({ ...data, id: inspectionId });
      setScheduledAtInput(toDateInputValue(data.scheduledFor));
      setSummaryDraft(data.aiSummaryDraft || data.aiSummary || "");

      const [inspectorDoc, roomDoc] = await Promise.all([
        getDocumentData<User>(COLLECTIONS.users, data.inspectorId),
        getDocumentData<Room>(COLLECTIONS.rooms, data.roomId),
      ]);
      setInspectorName(inspectorDoc.data?.name || data.inspectorId);
      setRoomNumber(roomDoc.data?.number || data.roomLabel || "—");

      const names: string[] = [];
      for (const tenantId of data.tenantIds || []) {
        const { data: tenantDoc } = await getDocumentData<User>(COLLECTIONS.users, tenantId);
        if (tenantDoc?.name) names.push(tenantDoc.name);
      }

      // Fallback for older/stale inspections where tenantIds may be missing:
      // derive tenant names from active room memberships.
      if (names.length === 0 && data.roomId) {
        const tenantMembershipSnap = await queryCollection(
          COLLECTIONS.memberships,
          where("organizationId", "==", data.organizationId),
          where("role", "==", "TENANT"),
          where("status", "==", "ACTIVE"),
          where("roomId", "==", data.roomId),
        );
        for (const doc of tenantMembershipSnap.docs) {
          const membership = doc.data() as { userId?: string };
          const tenantId = membership.userId?.trim();
          if (!tenantId) continue;
          const { data: tenantDoc } = await getDocumentData<User>(COLLECTIONS.users, tenantId);
          if (tenantDoc?.name) names.push(tenantDoc.name);
        }
      }
      setTenantNames([...new Set(names)]);

      const [mediaSnap, itemsSnap] = await Promise.all([
        queryCollection(COLLECTIONS.media, where("inspectionId", "==", inspectionId)),
        queryCollection(COLLECTIONS.inspectionItems, where("inspectionId", "==", inspectionId)),
      ]);
      const resolvedMedia: Array<{ id: string; storagePath: string; downloadUrl: string; uploadedBy: string }> = [];
      for (const doc of mediaSnap.docs) {
        const media = doc.data() as Media;
        try {
          const url = await getDownloadUrl(media.storagePath);
          resolvedMedia.push({
            id: doc.id,
            storagePath: media.storagePath,
            downloadUrl: url,
            uploadedBy: media.uploadedBy,
          });
        } catch {
          // Keep row even if URL is temporarily unavailable.
          resolvedMedia.push({
            id: doc.id,
            storagePath: media.storagePath,
            downloadUrl: "",
            uploadedBy: media.uploadedBy,
          });
        }
      }
      setMediaItems(resolvedMedia);
      setItemRows(itemsSnap.docs.map((doc) => ({ id: doc.id, data: doc.data() as InspectionItem })));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load inspection detail.");
    } finally {
      setLoading(false);
    }
  }, [inspectionId, organizationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function transitionTo(next: InspectionStatus) {
    if (!inspection) return;
    if (!ALLOWED_TRANSITIONS[inspection.status].includes(next)) {
      toast.error(`Transition ${inspection.status} -> ${next} is not allowed.`);
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        status: next,
        updatedAt: dateToTimestamp(new Date()),
      };

      if (next === "IN_PROGRESS") payload.startedAt = dateToTimestamp(new Date());
      if (next === "COMPLETED") payload.completedAt = dateToTimestamp(new Date());
      if (next === "SCHEDULED") {
        payload.startedAt = null;
        payload.completedAt = null;
      }

      await updateDocument(COLLECTIONS.inspections, inspection.id, payload);
      toast.success(`Status updated to ${next}.`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function saveReschedule() {
    if (!inspection) return;
    const nextDate = new Date(scheduledAtInput);
    if (Number.isNaN(nextDate.getTime())) {
      toast.error("Please enter a valid date/time.");
      return;
    }

    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.inspections, inspection.id, {
        scheduledFor: dateToTimestamp(nextDate),
        updatedAt: dateToTimestamp(new Date()),
      });
      toast.success("Inspection rescheduled.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reschedule inspection.");
    } finally {
      setSaving(false);
    }
  }

  async function runSummaryAction(action: "generate" | "review" | "finalize") {
    if (!inspection) return;
    setSummarySaving(true);
    try {
      const payload: Record<string, unknown> = { action };
      if (action === "review") payload.draft = summaryDraft.trim();
      if (action === "finalize") payload.finalSummary = summaryDraft.trim();

      const response = await fetch(`/api/inspections/${inspection.id}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        draft?: string;
        summary?: string;
        status?: InspectionSummaryStatus;
      };
      if (!response.ok) {
        throw new Error(data.error || "Summary action failed");
      }
      if (typeof data.draft === "string") setSummaryDraft(data.draft);
      if (typeof data.summary === "string") setSummaryDraft(data.summary);
      toast.success(
        action === "generate"
          ? "Draft summary generated."
          : action === "review"
            ? "Draft summary saved for review."
            : "Summary finalized.",
      );
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed summary action.");
    } finally {
      setSummarySaving(false);
    }
  }

  if (!inspection && !loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
        Inspection not found.
      </div>
    );
  }

  return (
    <section className={adminPageSectionClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={adminPageTitleClass}>Inspection detail</h1>
          <p className={adminPageDescClass}>
            Manage scheduling and lifecycle transitions with a controlled state model.
          </p>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Inspection ID: {inspectionId}</div>
        </div>
        <div className="flex gap-2">
          <BackLink
            href={organizationId ? `/admin/inspections?organizationId=${organizationId}` : "/admin/inspections"}
            aria-label="Back to inspections"
            className="mb-0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Context</div>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Room</div>
              <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{roomNumber}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Inspector</div>
              <div className="mt-1 text-zinc-700 dark:text-zinc-200">{inspectorName}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tenants</div>
              <div className="mt-1 text-zinc-700 dark:text-zinc-200">{tenantNames.join(", ") || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Type</div>
              <div className="mt-1 text-zinc-700 dark:text-zinc-200">{inspection?.type || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</div>
              <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{inspection?.status || "—"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Lifecycle Actions</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(inspection ? ALLOWED_TRANSITIONS[inspection.status] : []).map((next) => (
              <button
                key={next}
                type="button"
                onClick={() => void transitionTo(next)}
                disabled={saving || loading}
                className={adminSecondaryBtnClass}
              >
                Move to {next}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Scheduled date/time</label>
              <input
                type="datetime-local"
                value={scheduledAtInput}
                onChange={(e) => setScheduledAtInput(e.target.value)}
                className={adminInputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => void saveReschedule()}
              disabled={saving || loading}
              className={`${adminPrimaryBtnCompactClass} self-end`}
            >
              Save reschedule
            </button>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Timestamps</div>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Created</div>
                <div className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{formatDate(inspection?.createdAt)}</div>
              </div>
              <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Scheduled</div>
                <div className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{formatDate(inspection?.scheduledFor)}</div>
              </div>
              <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Started</div>
                <div className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{formatDate(inspection?.startedAt)}</div>
              </div>
              <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Completed</div>
                <div className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{formatDate(inspection?.completedAt)}</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Checklist findings</div>
            <div className="mt-3 space-y-4">
              {groupedSections.map(([section, sectionItems]) => (
                <div key={section} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                    {section.replace(/_/g, " ")}
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {sectionItems.map((item) => (
                      <div key={item.id} className="grid gap-2 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="text-sm text-zinc-700 dark:text-zinc-200">{item.data.prompt}</div>
                        <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                          {item.data.response}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {itemRows.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  No checklist items submitted yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inspector notes</div>
            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
              {sharedInspectionNote || "No inspector notes were provided for this inspection."}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Media evidence</div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {mediaItems.map((media) => (
                <div key={media.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                  <a
                    href={media.downloadUrl || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                    title={media.downloadUrl ? "Open full-size image" : "URL unavailable"}
                  >
                    <div className="relative h-52 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {media.downloadUrl ? (
                        <Image
                          src={media.downloadUrl}
                          alt="Inspection media"
                          fill
                          sizes="(max-width: 768px) 90vw, 420px"
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                          URL unavailable
                        </div>
                      )}
                    </div>
                  </a>
                  <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">By: {media.uploadedBy}</div>
                </div>
              ))}
              {mediaItems.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  No uploaded media for this inspection yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                AI summary review
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Status: {inspection?.aiSummaryStatus || "NONE"}
              </div>
            </div>
            <textarea
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              placeholder="Generate a draft summary, review edits, then finalize for tenant visibility."
              className={`mt-3 ${adminTextareaClass}`}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void runSummaryAction("generate")}
                disabled={summarySaving}
                className={adminSecondaryBtnClass}
              >
                Generate draft
              </button>
              <button
                type="button"
                onClick={() => void runSummaryAction("review")}
                disabled={summarySaving || !summaryDraft.trim()}
                className={adminSecondaryBtnClass}
              >
                Save review edits
              </button>
              <button
                type="button"
                onClick={() => void runSummaryAction("finalize")}
                disabled={summarySaving || !summaryDraft.trim()}
                className={adminPrimaryBtnCompactClass}
              >
                Finalize summary
              </button>
            </div>
            {inspection?.aiSummary ? (
              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Final summary
                </div>
                {inspection.aiSummary}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { where } from "firebase/firestore";
import { BackLink } from "@/components/auth/ui";
import { tenantPortalHref } from "@/lib/portal/portalOrgNavigation";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import {
  COLLECTIONS,
  getDocumentData,
  queryCollection,
} from "@/app/lib/firebase/firestore";
import { getDownloadUrl } from "@/app/lib/firebase/storage";
import type {
  Building,
  Inspection,
  InspectionItem,
  InspectionStatus,
  Media,
  Room,
  User,
  WithId,
} from "@/types";

type MediaRow = WithId<Media> & {
  downloadUrl: string;
};

function formatDate(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  return String(value);
}

function statusPillClass(status: InspectionStatus) {
  if (status === "COMPLETED") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
  }
  if (status === "IN_PROGRESS") return "bg-accent/10 text-accent";
  if (status === "CANCELED") {
    return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
}

export function TenantInspectionDetailClient({
  inspectionId,
}: {
  inspectionId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const tenantListHref = tenantPortalHref(organizationId);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inspection, setInspection] = useState<WithId<Inspection> | null>(null);
  const [inspectorName, setInspectorName] = useState("—");
  const [roomLabel, setRoomLabel] = useState("—");
  const [buildingLabel, setBuildingLabel] = useState("—");
  const [items, setItems] = useState<WithId<InspectionItem>[]>([]);
  const [mediaRows, setMediaRows] = useState<MediaRow[]>([]);

  const groupedMedia = useMemo(() => {
    const map: Record<string, MediaRow[]> = {};
    for (const row of mediaRows) {
      const key = row.inspectionItemId || "unscoped";
      if (!map[key]) map[key] = [];
      map[key].push(row);
    }
    return map;
  }, [mediaRows]);

  const loadInspection = useCallback(
    async (uid: string) => {
      setLoading(true);
      try {
        const { data } = await getDocumentData<Inspection>(
          COLLECTIONS.inspections,
          inspectionId,
        );
        if (!data) {
          toast.error("Inspection not found.");
          router.replace(tenantListHref);
          return;
        }
        if (!data.tenantIds.includes(uid)) {
          toast.error("You do not have access to this inspection.");
          router.replace(tenantListHref);
          return;
        }
        setInspection({ ...data, id: inspectionId });

        const [roomDoc, inspectorDoc, itemsSnap, mediaSnap] = await Promise.all([
          getDocumentData<Room>(COLLECTIONS.rooms, data.roomId),
          getDocumentData<User>(COLLECTIONS.users, data.inspectorId),
          queryCollection(
            COLLECTIONS.inspectionItems,
            where("inspectionId", "==", inspectionId),
          ),
          queryCollection(COLLECTIONS.media, where("inspectionId", "==", inspectionId)),
        ]);

        setInspectorName(inspectorDoc.data?.name || data.inspectorId);
        setRoomLabel(roomDoc.data?.number || data.roomLabel || "—");

        if (roomDoc.data?.buildingId) {
          const { data: buildingDoc } = await getDocumentData<Building>(
            COLLECTIONS.buildings,
            roomDoc.data.buildingId,
          );
          if (buildingDoc) {
            setBuildingLabel(`${buildingDoc.code} - ${buildingDoc.name}`);
          }
        }

        const itemRows = itemsSnap.docs.map((doc) => ({
          ...(doc.data() as InspectionItem),
          id: doc.id,
        }));
        setItems(itemRows);

        const resolvedMedia: MediaRow[] = [];
        for (const doc of mediaSnap.docs) {
          const media = doc.data() as Media;
          try {
            const url = await getDownloadUrl(media.storagePath);
            resolvedMedia.push({ ...media, id: doc.id, downloadUrl: url });
          } catch {
            resolvedMedia.push({ ...media, id: doc.id, downloadUrl: "" });
          }
        }
        setMediaRows(resolvedMedia);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load inspection detail.",
        );
      } finally {
        setLoading(false);
        setChecking(false);
      }
    },
    [inspectionId, router, tenantListHref],
  );

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        router.replace("/signup?step=login-chooser");
        return;
      }
      await loadInspection(user.uid);
    });
    return unsubscribe;
  }, [loadInspection, router]);

  if (checking) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-zinc-50 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
        Loading inspection detail…
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-zinc-50 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
        Inspection unavailable.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <BackLink href={tenantListHref} aria-label="Back to inspections" className="mb-0 w-fit shrink-0" />
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Status
            </div>
            <div className="mt-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(
                  inspection.status,
                )}`}
              >
                {inspection.status}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Type
            </div>
            <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {inspection.type}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Inspector
            </div>
            <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {inspectorName}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Scheduled
            </div>
            <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {formatDate(inspection.scheduledFor)}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Inspection summary
          </h2>
          {inspection.aiSummaryStatus === "FINALIZED" && inspection.aiSummary ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
              {inspection.aiSummary}
            </p>
          ) : (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Summary is under internal review and will appear here once finalized.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Checklist findings
            </h2>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {items.length} item(s)
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Prompt</th>
                  <th className="px-4 py-3">Response</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const evidence = groupedMedia[item.id] ?? [];
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                        {item.section}
                      </td>
                      <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                        {item.prompt}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                          {item.response}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">
                        {item.notes || "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          {evidence.map((media) => (
                            <a
                              key={media.id}
                              href={media.downloadUrl || undefined}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex w-fit rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:bg-black dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-900"
                            >
                              {media.downloadUrl ? "Open evidence" : "Evidence unavailable"}
                            </a>
                          ))}
                          {evidence.length === 0 && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              No evidence
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      No checklist items have been submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            All uploaded evidence ({mediaRows.length})
          </h2>
          <div className="mt-3 space-y-2">
            {mediaRows.map((media) => (
              <div
                key={media.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {media.storagePath}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Uploaded: {formatDate(media.createdAt)}
                  </div>
                </div>
                {media.downloadUrl ? (
                  <a
                    href={media.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:bg-black dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-900"
                  >
                    Open media
                  </a>
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    URL unavailable
                  </span>
                )}
              </div>
            ))}
            {mediaRows.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No uploaded media for this inspection.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
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
  const sharedInspectionNote =
    items.find((item) => Boolean(item.notes && item.notes.trim()))?.notes?.trim() || "";
  const groupedItems = items.reduce<Record<string, WithId<InspectionItem>[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});
  const groupedSections = Object.entries(groupedItems);

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
        const hasExplicitAssignment = Array.isArray(data.tenantIds) && data.tenantIds.includes(uid);
        if (!hasExplicitAssignment) {
          const membershipId = `${uid}-${data.organizationId}`;
          const { data: membership } = await getDocumentData<{
            role?: string;
            status?: string;
            roomId?: string;
          }>(
            COLLECTIONS.memberships,
            membershipId,
          );
          const hasRoomMembershipAccess =
            membership?.role === "TENANT" &&
            membership?.status === "ACTIVE" &&
            membership?.roomId === data.roomId;
          if (!hasRoomMembershipAccess) {
            toast.error("You do not have access to this inspection.");
            router.replace(tenantListHref);
            return;
          }
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
    let cancelled = false;
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        if (!cancelled) router.replace("/signup?step=login-chooser");
        return;
      }
      try {
        await loadInspection(user.uid);
      } catch {
        // Ignore auth-transition race errors while signing out/navigation changes.
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
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
          <div className="mt-4 space-y-4">
            {groupedSections.map(([section, sectionItems]) => (
              <div key={section} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  {section.replace(/_/g, " ")}
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {sectionItems.map((item) => (
                    <div key={item.id} className="grid gap-2 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="text-sm text-zinc-700 dark:text-zinc-200">{item.prompt}</div>
                      <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        {item.response}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!loading && items.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No checklist items have been submitted yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Inspector notes
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
            {sharedInspectionNote || "No inspector notes were provided for this inspection."}
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            All uploaded evidence ({mediaRows.length})
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {mediaRows.map((media) => (
              <div key={media.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="relative h-28 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  {media.downloadUrl ? (
                    <Image
                      src={media.downloadUrl}
                      alt="Inspection media"
                      fill
                      sizes="240px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                      URL unavailable
                    </div>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {formatDate(media.createdAt)}
                </div>
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

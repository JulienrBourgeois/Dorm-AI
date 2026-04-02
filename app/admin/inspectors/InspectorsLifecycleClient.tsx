"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { deleteField, where } from "firebase/firestore";
import { toast } from "sonner";
import { auth } from "@/app/lib/firebase/app";
import {
  COLLECTIONS,
  dateToTimestamp,
  getDocumentData,
  queryCollection,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import { createInspectorInvite } from "@/lib/admin/membershipInvites";
import { parseInspectorInviteCsv } from "@/lib/csv/parseInviteCsv";
import { CopyInviteLinkActions } from "@/components/admin/CopyInviteLinkActions";
import { BulkInviteCsvCard } from "@/components/admin/BulkInviteCsvCard";
import { InviteJoinHelpCard } from "@/components/admin/InviteJoinHelpCard";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { membershipStatusLabel } from "@/lib/admin/membershipDisplay";
import { withAdminOrganizationId } from "@/lib/admin/adminOrgQuery";
import {
  adminCardClass,
  adminCardTableWrapClass,
  adminEmptyStateClass,
  adminInputClass,
  adminPageDescClass,
  adminPageSectionClass,
  adminPageTitleClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
  adminTableHeaderRowClass,
} from "@/components/admin/adminConsolePrimitives";
import type { Building, MembershipStatus, User, WithId } from "@/types";

type InspectorMembershipDoc = {
  userId: string;
  organizationId: string;
  role: "INSPECTOR";
  status: MembershipStatus;
  assignedBuildingIds?: string[];
  /** Set when created via invite; cleared when membership is activated. */
  pendingInviteCode?: string;
};

type InspectorRow = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  status: MembershipStatus;
  assignedBuildingIds: string[];
  pendingInviteCode?: string;
};

const INSPECTOR_CSV_TEMPLATE = `name,email,building
Alex Smith,alex@example.com,NH
`;

export function InspectorsLifecycleClient() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<InspectorRow[]>([]);
  const [buildings, setBuildings] = useState<Array<WithId<Building>>>([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string>>({});
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBuildingId, setInviteBuildingId] = useState("");
  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [membershipSnap, buildingsSnap] = await Promise.all([
        queryCollection(
          COLLECTIONS.memberships,
          where("organizationId", "==", organizationId),
          where("role", "==", "INSPECTOR"),
        ),
        queryCollection(COLLECTIONS.buildings, where("organizationId", "==", organizationId)),
      ]);

      const buildingList: Array<WithId<Building>> = buildingsSnap.docs.map((doc) => ({
        ...(doc.data() as Building),
        id: doc.id,
      }));
      buildingList.sort((a, b) => a.code.localeCompare(b.code));
      setBuildings(buildingList);

      const nextRows: InspectorRow[] = [];
      for (const doc of membershipSnap.docs) {
        const m = doc.data() as InspectorMembershipDoc;
        const { data: user } = await getDocumentData<User>(COLLECTIONS.users, m.userId);
        nextRows.push({
          membershipId: doc.id,
          userId: m.userId,
          name: user?.name || "Unknown user",
          email: user?.email || "—",
          status: m.status,
          assignedBuildingIds: m.assignedBuildingIds ?? [],
          pendingInviteCode: m.pendingInviteCode,
        });
      }
      nextRows.sort((a, b) => a.name.localeCompare(b.name));
      setRows(nextRows);

      const nextDrafts: Record<string, string> = {};
      for (const row of nextRows) {
        nextDrafts[row.membershipId] = row.assignedBuildingIds[0] ?? "";
      }
      setAssignmentDrafts(nextDrafts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load inspectors.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const buildingMap = useMemo(() => {
    const map: Record<string, WithId<Building>> = {};
    for (const b of buildings) map[b.id] = b;
    return map;
  }, [buildings]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      const buildingNames = row.assignedBuildingIds.map((id) => buildingMap[id]?.code ?? "").join(" ");
      const hay = `${row.name} ${row.email} ${row.userId} ${buildingNames}`.toLowerCase();
      return hay.includes(term);
    });
  }, [rows, search, buildingMap]);

  async function handleInviteInspector() {
    if (!organizationId) return;
    const name = inviteName.trim();
    const email = inviteEmail.trim().toLowerCase();
    if (!name || !email) {
      toast.error("Name and email are required.");
      return;
    }

    setSaving(true);
    try {
      const result = await createInspectorInvite({
        organizationId,
        name,
        email,
        buildingId: inviteBuildingId || null,
        currentUser: auth.currentUser,
      });
      if (!result.emailSent) {
        toast.warning(
          "Invite created. Email could not be sent — copy the join link from the inspector row.",
        );
      } else {
        toast.success("Inspector invite created.");
      }
      setInviteName("");
      setInviteEmail("");
      setInviteBuildingId("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite inspector.");
    } finally {
      setSaving(false);
    }
  }

  const handleBulkInspectorInvites = useCallback(
    async (parsed: ReturnType<typeof parseInspectorInviteCsv>["rows"]) => {
      const failures: string[] = [];
      let ok = 0;
      let failed = 0;
      for (const row of parsed) {
        let buildingId: string | undefined;
        if (row.buildingCode?.trim()) {
          const key = row.buildingCode.trim().toLowerCase();
          const match = buildings.find((b) => b.code.trim().toLowerCase() === key);
          if (!match) {
            failed++;
            failures.push(
              `${row.email}: no building "${row.buildingCode}" — use the building code from Buildings.`,
            );
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
          failures.push(
            `${row.email}: ${e instanceof Error ? e.message : "Failed to create invite."}`,
          );
        }
      }
      await refresh();
      return { ok, failed, failures };
    },
    [organizationId, buildings, refresh],
  );

  async function updateStatus(membershipId: string, nextStatus: MembershipStatus) {
    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.memberships, membershipId, {
        status: nextStatus,
        ...(nextStatus === "ACTIVE"
          ? { pendingInviteCode: deleteField() }
          : {}),
        updatedAt: dateToTimestamp(new Date()),
      });
      toast.success(`Inspector status set to ${nextStatus}.`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBuildingAssignment(membershipId: string) {
    const buildingId = assignmentDrafts[membershipId];
    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.memberships, membershipId, {
        assignedBuildingIds: buildingId ? [buildingId] : [],
        updatedAt: dateToTimestamp(new Date()),
      });
      toast.success("Inspector building assignment updated.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign building.");
    } finally {
      setSaving(false);
    }
  }

  const inviteBuildingOptions = useMemo(
    () => [
      { value: "", label: "No building assigned yet" },
      ...buildings.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` })),
    ],
    [buildings],
  );

  const buildingsLink = useMemo(
    () => withAdminOrganizationId("/admin/buildings", organizationId),
    [organizationId],
  );

  if (!organizationId) {
    return (
      <div className={adminEmptyStateClass}>
        Go to{" "}
        <Link href="/home/dashboard" className="font-semibold underline">
          home
        </Link>{" "}
        and open an organization you admin to manage inspectors.
      </div>
    );
  }

  return (
    <section className={adminPageSectionClass}>
      <div>
        <h1 className={adminPageTitleClass}>Inspectors</h1>
        <p className={adminPageDescClass}>
          Invite inspectors, manage membership status, and assign buildings.
        </p>
      </div>

      <InviteJoinHelpCard />

      {buildings.length === 0 ? (
        <div className="rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-100">
          <span className="font-medium">No buildings yet.</span>{" "}
          <Link href={buildingsLink} className="font-semibold text-amber-900 underline decoration-amber-700/40 underline-offset-2 hover:decoration-amber-800 dark:text-amber-50 dark:decoration-amber-400/50">
            Add buildings
          </Link>{" "}
          first so you can assign inspectors to a site when inviting or editing.
        </div>
      ) : null}

      <div className={adminCardClass}>
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Invite one inspector</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Inspector name"
            className={adminInputClass}
          />
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Inspector email"
            className={adminInputClass}
          />
          <AdminSelect
            value={inviteBuildingId}
            onChange={setInviteBuildingId}
            options={inviteBuildingOptions}
            aria-label="Building for invite"
          />
          <button
            type="button"
            onClick={() => void handleInviteInspector()}
            disabled={saving}
            className={`${adminPrimaryBtnClass} w-full md:w-auto`}
          >
            Invite inspector
          </button>
        </div>
      </div>

      <div className={adminCardClass}>
        <BulkInviteCsvCard
          title="Bulk invite from CSV"
          summary="Upload a spreadsheet with columns name, email, and optional building (building code). Download the template to get the format right."
          templateFilename="inspector-invites-template.csv"
          templateCsv={INSPECTOR_CSV_TEMPLATE}
          parseCsv={parseInspectorInviteCsv}
          previewHeaders={["Name", "Email", "Building"]}
          previewRow={(row) => [row.name, row.email, row.buildingCode ?? "—"]}
          onInviteAll={handleBulkInspectorInvites}
          disabled={saving}
        />
      </div>

      <div id="inspector-records" className={`${adminCardTableWrapClass} scroll-mt-24`}>
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div className="min-w-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            Inspector records
            {!loading && rows.length > 0 ? (
              <span className="ml-1.5 font-normal text-zinc-500 dark:text-zinc-400">
                ({filteredRows.length === rows.length
                  ? `${rows.length}`
                  : `${filteredRows.length} of ${rows.length}`}
                )
              </span>
            ) : null}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inspectors…"
            className={`${adminInputClass} h-10 sm:max-w-xs`}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-sm">
            <caption className="sr-only">
              Inspectors for this organization: name, assigned buildings, status, and actions.
            </caption>
            <thead>
              <tr className={adminTableHeaderRowClass}>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Inspector
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Assigned buildings
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-accent dark:border-zinc-600 dark:border-t-accent"
                        aria-hidden
                      />
                      Loading inspectors…
                    </span>
                  </td>
                </tr>
              ) : null}
              {!loading &&
                filteredRows.map((row, index) => {
                const assigned = row.assignedBuildingIds
                  .map((id) => {
                    const b = buildingMap[id];
                    return b ? `${b.code}` : id;
                  })
                  .join(", ");
                const statusClass =
                  row.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : row.status === "INVITED"
                      ? "bg-accent/10 text-accent"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
                const stripe =
                  index % 2 === 1 ? "bg-zinc-50/80 dark:bg-zinc-900/30" : "bg-white dark:bg-zinc-950/20";
                return (
                  <tr
                    key={row.membershipId}
                    className={`border-b border-zinc-100 transition-colors hover:bg-zinc-100/90 dark:border-zinc-800 dark:hover:bg-zinc-800/40 ${stripe}`}
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{row.email}</div>
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{assigned || "—"}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                        {membershipStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/inspectors/${row.userId}?organizationId=${organizationId}`}
                          className={adminSecondaryBtnClass}
                        >
                          Details
                        </Link>
                        {row.status === "INVITED" && row.pendingInviteCode ? (
                          <CopyInviteLinkActions code={row.pendingInviteCode} />
                        ) : null}
                        <AdminSelect
                          size="sm"
                          className="max-w-[14rem]"
                          value={assignmentDrafts[row.membershipId] ?? ""}
                          onChange={(v) =>
                            setAssignmentDrafts((prev) => ({ ...prev, [row.membershipId]: v }))
                          }
                          options={[
                            { value: "", label: "No building" },
                            ...buildings.map((b) => ({
                              value: b.id,
                              label: `${b.code} — ${b.name}`,
                            })),
                          ]}
                          aria-label={`Assign building for ${row.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => void saveBuildingAssignment(row.membershipId)}
                          disabled={saving}
                          className={adminSecondaryBtnClass}
                        >
                          Assign building
                        </button>
                        {row.status !== "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() => void updateStatus(row.membershipId, "ACTIVE")}
                            disabled={saving}
                            className={adminSecondaryBtnClass}
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void updateStatus(row.membershipId, "INACTIVE")}
                            disabled={saving}
                            className={adminSecondaryBtnClass}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredRows.length === 0 && rows.length > 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No inspectors match your search. Try a different name, email, or building code.
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No inspectors yet. Invite someone above—they’ll appear here as{" "}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Invited</span> until they join.
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

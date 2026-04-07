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
import { createTenantInvite } from "@/lib/admin/membershipInvites";
import { parseTenantInviteCsv } from "@/lib/csv/parseInviteCsv";
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
import type { MembershipStatus, Room, User, WithId } from "@/types";

type MembershipDoc = {
  userId: string;
  organizationId: string;
  role: "TENANT";
  status: MembershipStatus;
  roomId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  pendingInviteCode?: string;
};

type TenantRow = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  status: MembershipStatus;
  roomId?: string;
  pendingInviteCode?: string;
};

const TENANT_CSV_TEMPLATE = `name,email,room
Jane Doe,jane@example.com,101A
`;

export function TenantsLifecycleClient() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [rooms, setRooms] = useState<Array<WithId<Room>>>([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string>>({});
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoomId, setInviteRoomId] = useState("");
  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [membershipSnap, roomsSnap] = await Promise.all([
        queryCollection(
          COLLECTIONS.memberships,
          where("organizationId", "==", organizationId),
          where("role", "==", "TENANT"),
        ),
        queryCollection(COLLECTIONS.rooms, where("organizationId", "==", organizationId)),
      ]);

      const roomList: Array<WithId<Room>> = roomsSnap.docs.map((doc) => ({
        ...(doc.data() as Room),
        id: doc.id,
      }));
      roomList.sort((a, b) => a.number.localeCompare(b.number));
      setRooms(roomList);

      const nextRows: TenantRow[] = [];
      for (const doc of membershipSnap.docs) {
        const m = doc.data() as MembershipDoc;
        const { data: user } = await getDocumentData<User>(COLLECTIONS.users, m.userId);
        nextRows.push({
          membershipId: doc.id,
          userId: m.userId,
          name: user?.name || "Unknown user",
          email: user?.email || "—",
          status: m.status,
          roomId: m.roomId,
          pendingInviteCode: m.pendingInviteCode,
        });
      }
      nextRows.sort((a, b) => a.name.localeCompare(b.name));
      setRows(nextRows);

      const nextDrafts: Record<string, string> = {};
      for (const row of nextRows) {
        nextDrafts[row.membershipId] = row.roomId ?? "";
      }
      setAssignmentDrafts(nextDrafts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load tenants.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const roomsById = useMemo(() => {
    const map: Record<string, WithId<Room>> = {};
    for (const room of rooms) map[room.id] = room;
    return map;
  }, [rooms]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      const roomLabel = row.roomId ? roomsById[row.roomId]?.number ?? "" : "";
      const hay = `${row.name} ${row.email} ${row.userId} ${roomLabel}`.toLowerCase();
      return hay.includes(term);
    });
  }, [rows, search, roomsById]);

  async function handleInviteTenant() {
    if (!organizationId) return;
    const name = inviteName.trim();
    const email = inviteEmail.trim().toLowerCase();
    if (!name || !email) {
      toast.error("Name and email are required.");
      return;
    }

    setSaving(true);
    try {
      const result = await createTenantInvite({
        organizationId,
        name,
        email,
        roomId: inviteRoomId || null,
        currentUser: auth.currentUser,
      });
      if (!result.emailSent) {
        toast.warning(
          "Invite created. Email could not be sent — copy the join link from the tenant row.",
        );
      } else {
        toast.success("Tenant invite created.");
      }
      setInviteName("");
      setInviteEmail("");
      setInviteRoomId("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite tenant.");
    } finally {
      setSaving(false);
    }
  }

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
          failures.push(
            `${row.email}: ${e instanceof Error ? e.message : "Failed to create invite."}`,
          );
        }
      }
      await refresh();
      return { ok, failed, failures };
    },
    [organizationId, rooms, refresh],
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
      toast.success(`Tenant status set to ${nextStatus}.`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAssignment(membershipId: string) {
    const roomId = assignmentDrafts[membershipId] || null;
    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.memberships, membershipId, {
        roomId,
        updatedAt: dateToTimestamp(new Date()),
      });
      toast.success("Room assignment updated.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign room.");
    } finally {
      setSaving(false);
    }
  }

  const inviteRoomOptions = useMemo(
    () => [
      { value: "", label: "No room assigned yet" },
      ...rooms.map((room) => ({ value: room.id, label: room.number })),
    ],
    [rooms],
  );

  const roomsLink = useMemo(
    () => withAdminOrganizationId("/admin/rooms", organizationId),
    [organizationId],
  );

  if (!organizationId) {
    return (
      <div className={adminEmptyStateClass}>
        Go to{" "}
        <Link href="/home/dashboard" className="font-semibold underline">
          home
        </Link>{" "}
        and open an organization you admin to manage tenants.
      </div>
    );
  }

  return (
    <section className={adminPageSectionClass}>
      <div>
        <h1 className={adminPageTitleClass}>Tenants</h1>
        <p className={adminPageDescClass}>
          Invite tenants, manage membership status, and assign rooms.
        </p>
      </div>

      <InviteJoinHelpCard />

      {rooms.length === 0 ? (
        <div className="rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-100">
          <span className="font-medium">No rooms yet.</span>{" "}
          <Link href={roomsLink} className="font-semibold text-amber-900 underline decoration-amber-700/40 underline-offset-2 hover:decoration-amber-800 dark:text-amber-50 dark:decoration-amber-400/50">
            Add rooms
          </Link>{" "}
          first so you can assign units when inviting or editing tenants.
        </div>
      ) : null}

      <div className={adminCardClass}>
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Invite one tenant</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Tenant name"
            className={adminInputClass}
          />
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Tenant email"
            className={adminInputClass}
          />
          <AdminSelect
            value={inviteRoomId}
            onChange={setInviteRoomId}
            options={inviteRoomOptions}
            aria-label="Room for invite"
          />
          <button
            type="button"
            onClick={() => void handleInviteTenant()}
            disabled={saving}
            className={`${adminPrimaryBtnClass} w-full md:w-auto`}
          >
            Invite tenant
          </button>
        </div>
      </div>

      <div className={adminCardClass}>
        <BulkInviteCsvCard
          title="Bulk invite from CSV"
          summary="Upload a spreadsheet with columns name, email, and optional room (room number). Download the template to get the format right."
          templateFilename="tenant-invites-template.csv"
          templateCsv={TENANT_CSV_TEMPLATE}
          parseCsv={parseTenantInviteCsv}
          previewHeaders={["Name", "Email", "Room"]}
          previewRow={(row) => [row.name, row.email, row.roomNumber ?? "—"]}
          onInviteAll={handleBulkTenantInvites}
          disabled={saving}
        />
      </div>

      <div id="tenant-records" className={`${adminCardTableWrapClass} scroll-mt-24`}>
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div className="min-w-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            Tenant records
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
            placeholder="Search tenants…"
            className={`${adminInputClass} h-10 sm:max-w-xs`}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-sm">
            <caption className="sr-only">
              Tenants for this organization: name, room, membership status, and actions.
            </caption>
            <thead>
              <tr className={adminTableHeaderRowClass}>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Tenant
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Room
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
                      Loading tenants…
                    </span>
                  </td>
                </tr>
              ) : null}
              {!loading &&
                filteredRows.map((row, index) => {
                const roomLabel = row.roomId ? roomsById[row.roomId]?.number ?? "Unknown room" : "—";
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
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{roomLabel}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                        {membershipStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/tenants/${row.userId}?organizationId=${organizationId}`}
                          className={adminSecondaryBtnClass}
                        >
                          Details
                        </Link>
                        {row.status === "INVITED" && row.pendingInviteCode ? (
                          <CopyInviteLinkActions
                            code={row.pendingInviteCode}
                            inviteeEmail={row.email.includes("@") ? row.email : undefined}
                          />
                        ) : null}

                        <AdminSelect
                          size="sm"
                          className="max-w-[11rem]"
                          value={assignmentDrafts[row.membershipId] ?? ""}
                          onChange={(v) =>
                            setAssignmentDrafts((prev) => ({ ...prev, [row.membershipId]: v }))
                          }
                          options={[
                            { value: "", label: "No room" },
                            ...rooms.map((room) => ({ value: room.id, label: room.number })),
                          ]}
                          aria-label={`Assign room for ${row.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => void saveAssignment(row.membershipId)}
                          disabled={saving}
                          className={adminSecondaryBtnClass}
                        >
                          Assign room
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
                    No tenants match your search. Try a different name, email, or room.
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No tenants yet. Invite someone above—they’ll appear here as{" "}
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

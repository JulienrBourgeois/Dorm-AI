"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { where } from "firebase/firestore";
import { toast } from "sonner";
import { auth } from "@/app/lib/firebase/app";
import { logAuditEvent } from "@/app/lib/audit/logEvent";
import {
  COLLECTIONS,
  dateToTimestamp,
  getDocumentData,
  queryCollection,
  setDocument,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import { triggerMembershipInviteEmail } from "@/lib/email/triggerFromClient";
import type { MembershipStatus, Room, User, WithId } from "@/types";

type MembershipDoc = {
  userId: string;
  organizationId: string;
  role: "TENANT";
  status: MembershipStatus;
  roomId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type TenantRow = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  status: MembershipStatus;
  roomId?: string;
};

function makeInviteCode(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

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
      const userId = `invite_tenant_${Date.now().toString(36)}`;
      const now = dateToTimestamp(new Date());
      await setDocument(COLLECTIONS.users, userId, {
        id: userId,
        name,
        email,
        role: "tenant",
        createdAt: now,
        updatedAt: now,
      });
      const membershipId = `${userId}-${organizationId}`;
      await setDocument(COLLECTIONS.memberships, membershipId, {
        id: membershipId,
        userId,
        organizationId,
        role: "TENANT",
        status: "INVITED",
        roomId: inviteRoomId || undefined,
        createdAt: now,
        updatedAt: now,
      });
      await logAuditEvent({
        eventType: "membership.created",
        actorId: "admin",
        entityType: "membership",
        entityId: membershipId,
        membershipId,
        organizationId,
        toStatus: "INVITED",
        source: "admin.tenants.invite",
      });

      const code = makeInviteCode("TEN");
      const expiresAt = dateToTimestamp(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
      await setDocument(COLLECTIONS.inviteCodes, code, {
        organizationId,
        role: "TENANT",
        inviteeEmail: email,
        inviteeName: name,
        roomId: inviteRoomId || null,
        createdAt: now,
        expiresAt,
      });

      const currentUser = auth.currentUser;
      if (currentUser) {
        void triggerMembershipInviteEmail(currentUser, {
          organizationId,
          role: "TENANT",
          inviteCode: code,
          inviteeEmail: email,
          inviteeName: name,
        }).catch(() => {
          toast.error(`Invite created, but email failed. Share this link: /join?code=${code}`);
        });
      } else {
        toast.error(`Invite created, but send email failed. Share this link: /join?code=${code}`);
      }

      toast.success("Tenant invite created and email queued.");
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

  async function updateStatus(membershipId: string, nextStatus: MembershipStatus) {
    setSaving(true);
    try {
      const previousStatus = rows.find((row) => row.membershipId === membershipId)?.status;
      await updateDocument(COLLECTIONS.memberships, membershipId, {
        status: nextStatus,
        updatedAt: dateToTimestamp(new Date()),
      });
      await logAuditEvent({
        eventType: "membership.status.changed",
        actorId: "admin",
        entityType: "membership",
        entityId: membershipId,
        membershipId,
        organizationId,
        fromStatus: previousStatus,
        toStatus: nextStatus,
        source: "admin.tenants.status",
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

  if (!organizationId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        Go to{" "}
        <Link href="/home/dashboard" className="font-semibold underline">
          home
        </Link>{" "}
        and open an organization you admin to manage tenants.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Tenants
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Invite tenants, manage membership status, and assign rooms.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Tenant name"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Tenant email"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          />
          <select
            value={inviteRoomId}
            onChange={(e) => setInviteRoomId(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="">No room assigned yet</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.number}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handleInviteTenant()}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            Invite tenant
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Tenant Records</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenants..."
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-accent sm:max-w-xs dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const roomLabel = row.roomId ? roomsById[row.roomId]?.number ?? "Unknown room" : "—";
                const statusClass =
                  row.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : row.status === "INVITED"
                      ? "bg-accent/10 text-accent"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
                return (
                  <tr key={row.membershipId} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{row.email}</div>
                    </td>
                    <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{roomLabel}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/tenants/${row.userId}?organizationId=${organizationId}`}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                        >
                          Details
                        </Link>

                        <select
                          value={assignmentDrafts[row.membershipId] ?? ""}
                          onChange={(e) =>
                            setAssignmentDrafts((prev) => ({ ...prev, [row.membershipId]: e.target.value }))
                          }
                          className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-xs outline-none focus:border-accent dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <option value="">No room</option>
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.number}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => void saveAssignment(row.membershipId)}
                          disabled={saving}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                        >
                          Assign room
                        </button>

                        {row.status !== "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() => void updateStatus(row.membershipId, "ACTIVE")}
                            disabled={saving}
                            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void updateStatus(row.membershipId, "INACTIVE")}
                            disabled={saving}
                            className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-100 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No tenants found for this organization.
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

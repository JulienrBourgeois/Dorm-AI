"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import {
  COLLECTIONS,
  getDocumentData,
  queryCollection,
} from "@/app/lib/firebase/firestore";
import { where } from "firebase/firestore";
import {
  ALL_ORGANIZATIONS_HUB_HREF,
  hrefForOrgEntry,
  isOrgRowSelectedForPortal,
  orgEntriesForPortal,
  type PortalKind,
} from "@/lib/portal/portalOrgNavigation";
import type { Organization } from "@/types/dorm";
import type { WithId } from "@/types";
import { OrganizationThumbnail } from "@/components/organization/OrganizationThumbnail";

interface MembershipDoc {
  userId: string;
  organizationId: string;
  role: string;
  status: string;
}

type OrgAccess = WithId<Organization> & { membershipRole: string };

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function roleLabel(role: string): string {
  if (role === "ADMIN") return "Admin";
  if (role === "INSPECTOR") return "Inspector";
  if (role === "TENANT") return "Tenant";
  return role;
}

type Props = { portal: PortalKind };

export function PortalOrgSelector({ portal }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  const [open, setOpen] = useState(false);
  const [orgAccess, setOrgAccess] = useState<OrgAccess[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const portalEntries = useMemo(
    () => orgEntriesForPortal(orgAccess, portal),
    [orgAccess, portal],
  );

  const searchKey = searchParams.toString();
  const onAdminLogin = pathname.startsWith("/admin/login");

  useEffect(() => {
    const unsub = subscribeToAuthState(async (user) => {
      if (!user) {
        setOrgAccess([]);
        setMembershipsLoading(false);
        return;
      }
      setMembershipsLoading(true);
      const snapshot = await queryCollection(
        COLLECTIONS.memberships,
        where("userId", "==", user.uid),
        where("status", "==", "ACTIVE"),
      );
      const list: OrgAccess[] = [];
      for (const d of snapshot.docs) {
        const m = d.data() as MembershipDoc;
        const { data: org } = await getDocumentData<Organization>(
          COLLECTIONS.organizations,
          m.organizationId,
        );
        if (org) {
          list.push({
            ...org,
            id: m.organizationId,
            membershipRole: m.role,
          });
        }
      }
      list.sort((a, b) =>
        (a.name ?? a.id).localeCompare(b.name ?? b.id, undefined, {
          sensitivity: "base",
        }),
      );
      setOrgAccess(list);
      setMembershipsLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setResolvedName(null);
      return;
    }
    const fromList = orgAccess.find((o) => o.id === organizationId);
    if (fromList?.name?.trim()) {
      setResolvedName(fromList.name.trim());
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await getDocumentData<Organization>(
        COLLECTIONS.organizations,
        organizationId,
      );
      if (!cancelled) setResolvedName(data?.name?.trim() || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [organizationId, orgAccess]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (onAdminLogin || membershipsLoading) return;
    if (portalEntries.length === 0) return;
    const id = organizationId.trim();
    if (!id) {
      router.replace(hrefForOrgEntry(portal, pathname, searchParams, portalEntries[0]));
      return;
    }
    const valid = portalEntries.some((e) => e.id === id);
    if (!valid) {
      router.replace(hrefForOrgEntry(portal, pathname, searchParams, portalEntries[0]));
    }
  }, [
    membershipsLoading,
    onAdminLogin,
    organizationId,
    pathname,
    portal,
    portalEntries,
    router,
    searchKey,
  ]);

  const currentOrgEntry = useMemo(() => {
    const id = organizationId.trim();
    if (!id) return undefined;
    return portalEntries.find((e) => e.id === id);
  }, [organizationId, portalEntries]);

  let displayLabel: string;
  if (onAdminLogin) {
    displayLabel = organizationId ? (resolvedName ?? "Loading…") : "Organization";
  } else if (membershipsLoading) {
    displayLabel = "Loading…";
  } else if (portalEntries.length === 0) {
    displayLabel = "No organization";
  } else if (!organizationId.trim()) {
    displayLabel = "Loading…";
  } else {
    displayLabel = resolvedName ?? "Loading…";
  }

  function selectOrg(entry: OrgAccess) {
    router.push(hrefForOrgEntry(portal, pathname, searchParams, entry));
    setOpen(false);
  }

  function selectAllOrganizations() {
    router.push(ALL_ORGANIZATIONS_HUB_HREF);
    setOpen(false);
  }

  return (
    <div className="relative w-fit min-w-0 max-w-xs sm:max-w-sm" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg py-1.5 pl-2 pr-1.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {currentOrgEntry ? (
          <OrganizationThumbnail
            name={currentOrgEntry.name}
            thumbnailStoragePath={currentOrgEntry.thumbnailStoragePath}
            variant="sm"
          />
        ) : null}
        <span className="min-w-0 truncate">{displayLabel}</span>
        <IconChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform dark:text-zinc-400 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-[min(70dvh,420px)] w-[min(calc(100vw-2rem),320px)] overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          role="listbox"
          aria-label="Organization"
        >
          <button
            type="button"
            role="option"
            aria-selected={false}
            onClick={selectAllOrganizations}
            className="flex w-full flex-col items-start gap-0.5 border-b border-zinc-100 px-3 py-2.5 text-left text-sm text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="font-medium">All organizations</span>
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              Home
            </span>
          </button>
          {portalEntries.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-400">
              {membershipsLoading ? "Loading…" : "No organizations for this portal."}
            </div>
          ) : null}
          {portalEntries.map((entry) => {
            const selected = isOrgRowSelectedForPortal(portal, organizationId, entry);
            const label = entry.name?.trim() || entry.id;
            return (
              <button
                key={`${entry.id}-${entry.membershipRole}`}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => selectOrg(entry)}
                className={`flex w-full flex-row items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  selected
                    ? "bg-sky-50 text-sky-950 dark:bg-sky-950/50 dark:text-sky-100"
                    : "text-zinc-800 dark:text-zinc-100"
                }`}
              >
                <OrganizationThumbnail
                  name={label}
                  thumbnailStoragePath={entry.thumbnailStoragePath}
                  variant="sm"
                />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <span className="font-medium">{label}</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                    {roleLabel(entry.membershipRole)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { where } from "firebase/firestore";
import { subscribeToAuthState } from "@/app/lib/firebase/auth";
import { COLLECTIONS, getDocumentData, queryCollection } from "@/app/lib/firebase/firestore";
import type { Organization } from "@/types";

type MembershipDoc = {
  userId?: string;
  organizationId?: string;
  role?: string;
  status?: string;
};

type OrganizationCard = Organization & { id: string };

export function AdminOrganizationSelectorClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationCard[]>([]);
  const [legacyAdminMemberships, setLegacyAdminMemberships] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const memberships = await queryCollection(
          COLLECTIONS.memberships,
          where("userId", "==", user.uid),
          where("role", "==", "ADMIN"),
          where("status", "==", "ACTIVE"),
        );

        const ids = new Set<string>();
        let legacyCount = 0;
        for (const doc of memberships.docs) {
          const data = doc.data() as MembershipDoc;
          if (typeof data.organizationId === "string" && data.organizationId.trim()) {
            ids.add(data.organizationId);
          } else {
            legacyCount += 1;
          }
        }
        setLegacyAdminMemberships(legacyCount);

        const results: OrganizationCard[] = [];
        for (const organizationId of ids) {
          const { data } = await getDocumentData<Organization>(
            COLLECTIONS.organizations,
            organizationId,
          );
          if (data) {
            results.push({ ...data, id: organizationId });
          }
        }

        results.sort((a, b) => a.name.localeCompare(b.name));
        setOrganizations(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load organizations.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        Loading your organizations…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
        Failed to load organizations: {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {organizations.map((org) => (
        <div key={org.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{org.name}</div>
          <div className="mt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">{org.slug}</div>
          <div className="mt-4 flex gap-2">
            <Link
              href={`/admin/dashboard?organizationId=${org.id}`}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create organization</div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Add a new organization and assign yourself as admin.
        </p>
        <div className="mt-4">
          <Link
            href="/home/new-property"
            className="block w-full rounded-xl bg-accent px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            + Create organization
          </Link>
        </div>
      </div>

      {organizations.length === 0 && (
        <div className="md:col-span-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
          No active admin organization memberships found yet. Create an organization to get started.
        </div>
      )}

      {legacyAdminMemberships > 0 && (
        <div className="md:col-span-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          Found {legacyAdminMemberships} legacy admin membership(s) without an `organizationId`. They are ignored here and should be migrated.
        </div>
      )}
    </div>
  );
}

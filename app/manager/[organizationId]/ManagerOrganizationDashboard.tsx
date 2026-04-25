"use client";

import { useEffect, useState } from "react";
import { getDocumentData, COLLECTIONS } from "@/app/lib/firebase/firestore";
import { BackLink } from "@/components/auth/ui";
import type { Organization } from "@/types/dorm";
import { Loader } from "@/components/Loader";
import { formatOrganizationCardSubtitle } from "@/lib/organizationDisplay";
import { OrganizationCardThumbnail } from "@/components/organization/OrganizationCardThumbnail";
import { OrganizationProfilePhoto } from "@/components/organization/OrganizationProfilePhoto";
import { getOrganizationCardThumbnailStoragePath } from "@/lib/organization/organizationCardThumbnailPath";
import { getOrganizationProfilePhotoStoragePath } from "@/lib/organization/organizationProfilePhotoPath";

export function ManagerOrganizationDashboard({
  organizationId: id,
}: {
  organizationId: string;
}) {
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    getDocumentData<Organization>(COLLECTIONS.organizations, id).then(({ data }) =>
      setOrganization(data ?? null)
    );
  }, [id]);

  if (!organization) {
    return <Loader fullPage />;
  }

  const orgWithLegacy = organization as Organization & { thumbnailStoragePath?: string };
  const cardBannerPath = getOrganizationCardThumbnailStoragePath(orgWithLegacy);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-10">
          <BackLink
            href={`/admin/dashboard?organizationId=${encodeURIComponent(id)}`}
            aria-label="Back to dashboard"
            className="mb-0"
          />
        </div>
      </header>
      <div className="border-b border-zinc-200 bg-white px-6 pb-6 dark:border-zinc-800 dark:bg-black lg:px-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-xl">
          {cardBannerPath ? (
            <OrganizationCardThumbnail
              name={organization.name}
              cardThumbnailPath={cardBannerPath}
              className="rounded-xl"
            />
          ) : (
            <OrganizationProfilePhoto
              name={organization.name}
              profilePhotoPath={getOrganizationProfilePhotoStoragePath(organization)}
              variant="banner"
            />
          )}
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {organization.name}
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          {formatOrganizationCardSubtitle(organization) || "Organization"}
        </p>
        {organization.website ? (
          <a
            href={organization.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
          >
            Website
          </a>
        ) : null}
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Dashboard for this organization is coming next (buildings, rooms, inspections).
        </p>
      </main>
    </div>
  );
}

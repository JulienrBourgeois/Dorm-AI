"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { deleteField } from "firebase/firestore";
import { toast } from "sonner";
import {
  COLLECTIONS,
  dateToTimestamp,
  getDocumentData,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import {
  buildOrganizationThumbnailPath,
  deleteFile,
  getDownloadUrl,
  uploadFile,
  validateOrganizationThumbnailFile,
} from "@/app/lib/firebase/storage";
import { OrganizationThumbnailField } from "@/components/organization/OrganizationThumbnailField";
import { AdminSelect } from "@/components/admin/AdminSelect";
import {
  adminCardClass,
  adminEmptyStateClass,
  adminInputClass,
  adminPageDescClass,
  adminPageSectionClass,
  adminPageTitleClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
} from "@/components/admin/adminConsolePrimitives";
import { Loader } from "@/components/Loader";
import {
  ORGANIZATION_TYPE_OPTIONS,
  formatOrganizationCardSubtitle,
} from "@/lib/organizationDisplay";
import type { Organization, OrganizationType } from "@/types/dorm";

type FormState = {
  name: string;
  organizationType: OrganizationType | "";
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  website: string;
};

function normalizeWebsiteInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    new URL(withProto);
    return withProto;
  } catch {
    return null;
  }
}

function formFromOrganization(org: Organization): FormState {
  return {
    name: org.name ?? "",
    organizationType: org.organizationType ?? "",
    addressLine1: org.addressLine1 ?? "",
    city: org.city ?? "",
    state: org.state ?? "",
    postalCode: org.postalCode ?? "",
    website: org.website ?? "",
  };
}

export function AdminSettingsClient() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    organizationType: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    website: "",
  });
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [initialThumbnailPath, setInitialThumbnailPath] = useState("");
  const [thumbnailResolvedUrl, setThumbnailResolvedUrl] = useState("");
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  useEffect(() => {
    if (!organizationId) {
      setOrganization(null);
      setInitialForm(null);
      setInitialThumbnailPath("");
      setThumbnailResolvedUrl("");
      setSelectedThumbnailFile(null);
      setRemoveThumbnail(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await getDocumentData<Organization>(
        COLLECTIONS.organizations,
        organizationId,
      );
      if (cancelled) return;
      setOrganization(data ?? null);
      const nextForm = data ? formFromOrganization(data) : null;
      setInitialForm(nextForm);
      setForm(
        nextForm ?? {
          name: "",
          organizationType: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          website: "",
        },
      );
      const thumbPath = data?.thumbnailStoragePath?.trim() ?? "";
      setInitialThumbnailPath(thumbPath);
      setSelectedThumbnailFile(null);
      setRemoveThumbnail(false);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  useEffect(() => {
    const path = organization?.thumbnailStoragePath?.trim();
    if (!path || removeThumbnail) {
      setThumbnailResolvedUrl("");
      return;
    }
    let cancelled = false;
    void getDownloadUrl(path)
      .then((u) => {
        if (!cancelled) setThumbnailResolvedUrl(u);
      })
      .catch(() => {
        if (!cancelled) setThumbnailResolvedUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [organization?.thumbnailStoragePath, removeThumbnail]);

  const dirty = useMemo(() => {
    if (!initialForm) return false;
    const formDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
    const thumbDirty =
      Boolean(selectedThumbnailFile) ||
      (removeThumbnail && Boolean(initialThumbnailPath));
    return formDirty || thumbDirty;
  }, [form, initialForm, selectedThumbnailFile, removeThumbnail, initialThumbnailPath]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!organizationId || !organization) return;

    const name = form.name.trim();
    if (!name) {
      toast.error("Please enter an organization name.");
      return;
    }

    const website = normalizeWebsiteInput(form.website);
    if (form.website.trim() && !website) {
      toast.error("Please enter a valid website URL.");
      return;
    }

    const existingThumb = organization.thumbnailStoragePath?.trim() ?? "";
    let uploadedThumbPath = "";
    let nextThumbPath: string | undefined = undefined;
    if (removeThumbnail) {
      nextThumbPath = undefined;
    } else if (selectedThumbnailFile) {
      const photoErr = validateOrganizationThumbnailFile(selectedThumbnailFile);
      if (photoErr) {
        toast.error(photoErr);
        return;
      }
      const uploadPath = buildOrganizationThumbnailPath(
        organizationId,
        selectedThumbnailFile.name,
      );
      try {
        await uploadFile(uploadPath, selectedThumbnailFile, {
          contentType: selectedThumbnailFile.type || "image/jpeg",
        });
        uploadedThumbPath = uploadPath;
        nextThumbPath = uploadPath;
      } catch {
        toast.error("Could not upload thumbnail.");
        return;
      }
    }

    const thumbPayload: Record<string, unknown> = {};
    if (removeThumbnail) {
      thumbPayload.thumbnailStoragePath = deleteField();
    } else if (selectedThumbnailFile && nextThumbPath) {
      thumbPayload.thumbnailStoragePath = nextThumbPath;
    }

    setSaving(true);
    try {
      await updateDocument(COLLECTIONS.organizations, organizationId, {
        name,
        organizationType: form.organizationType || deleteField(),
        addressLine1: form.addressLine1.trim() || deleteField(),
        city: form.city.trim() || deleteField(),
        state: form.state.trim() || deleteField(),
        postalCode: form.postalCode.trim() || deleteField(),
        website: website || deleteField(),
        ...thumbPayload,
        updatedAt: dateToTimestamp(new Date()),
      });

      if (
        existingThumb &&
        (removeThumbnail || (nextThumbPath && existingThumb !== nextThumbPath))
      ) {
        void deleteFile(existingThumb).catch(() => undefined);
      }

      const nextThumbStored = removeThumbnail ? undefined : nextThumbPath ?? organization.thumbnailStoragePath;
      const nextOrganization: Organization = {
        ...organization,
        name,
        organizationType: form.organizationType || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        website: website || undefined,
        thumbnailStoragePath: nextThumbStored,
      };
      const nextForm = formFromOrganization(nextOrganization);
      setOrganization(nextOrganization);
      setInitialForm(nextForm);
      setForm(nextForm);
      setInitialThumbnailPath(nextThumbStored?.trim() ?? "");
      setSelectedThumbnailFile(null);
      setRemoveThumbnail(false);
      toast.success("Organization updated.");
    } catch (err) {
      if (uploadedThumbPath) {
        void deleteFile(uploadedThumbPath).catch(() => undefined);
      }
      toast.error(err instanceof Error ? err.message : "Failed to update organization.");
    } finally {
      setSaving(false);
    }
  }

  function handleSelectThumbnail(file: File | null) {
    if (!file) {
      setSelectedThumbnailFile(null);
      return;
    }
    const err = validateOrganizationThumbnailFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setSelectedThumbnailFile(file);
    setRemoveThumbnail(false);
  }

  if (!organizationId) {
    return (
      <div className={adminEmptyStateClass}>
        Go to{" "}
        <Link href="/home/dashboard" className="font-semibold underline">
          home
        </Link>{" "}
        and open an organization you admin to manage its settings.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader message="Loading settings…" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className={adminEmptyStateClass}>
        We couldn&apos;t load this organization. Go back to{" "}
        <Link href="/home/dashboard" className="font-semibold underline">
          home
        </Link>{" "}
        and choose an organization again.
      </div>
    );
  }

  const subtitle = formatOrganizationCardSubtitle(organization);

  return (
    <section className={adminPageSectionClass}>
      <div>
        <h1 className={adminPageTitleClass}>Settings</h1>
        <p className={adminPageDescClass}>
          Edit the selected organization&apos;s profile and contact details.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${adminCardClass} lg:col-span-1`}>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Current organization
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Name
              </div>
              <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                {organization.name}
              </div>
              {subtitle ? (
                <div className="mt-1 text-zinc-600 dark:text-zinc-300">{subtitle}</div>
              ) : null}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Organization ID
              </div>
              <div className="mt-1 break-all font-mono text-xs text-zinc-700 dark:text-zinc-200">
                {organizationId}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Slug
              </div>
              <div className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-200">
                {organization.slug || "—"}
              </div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Slug stays fixed for now.
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`${adminCardClass} lg:col-span-2 ${saving ? "pointer-events-none opacity-70" : ""}`}
          aria-busy={saving}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Organization profile
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (initialForm) setForm(initialForm);
                  setSelectedThumbnailFile(null);
                  setRemoveThumbnail(false);
                }}
                disabled={!dirty || saving}
                className={adminSecondaryBtnClass}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={!dirty || saving}
                className={adminPrimaryBtnClass}
              >
                Save changes
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex flex-wrap items-end gap-4">
              <OrganizationThumbnailField
                organizationName={form.name.trim() || organization.name}
                currentThumbnailUrl={!removeThumbnail ? thumbnailResolvedUrl : undefined}
                selectedFile={selectedThumbnailFile}
                disabled={saving}
                onSelectFile={handleSelectThumbnail}
                onClearSelection={() => setSelectedThumbnailFile(null)}
                onRemoveCurrent={() => {
                  setRemoveThumbnail(true);
                  setSelectedThumbnailFile(null);
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="org-name"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                Organization name
              </label>
              <input
                id="org-name"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                className={adminInputClass}
                placeholder="Organization name"
              />
            </div>

            <div>
              <label
                htmlFor="org-type"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                Organization type
              </label>
              <AdminSelect
                id="org-type"
                value={form.organizationType}
                onChange={(value) =>
                  setForm((s) => ({ ...s, organizationType: value as OrganizationType | "" }))
                }
                options={[
                  { value: "", label: "Not set" },
                  ...ORGANIZATION_TYPE_OPTIONS,
                ]}
                aria-label="Organization type"
              />
            </div>

            <div>
              <label
                htmlFor="org-website"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                Website
              </label>
              <input
                id="org-website"
                value={form.website}
                onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
                className={adminInputClass}
                placeholder="example.com"
                inputMode="url"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="org-address"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                Street address
              </label>
              <input
                id="org-address"
                value={form.addressLine1}
                onChange={(e) => setForm((s) => ({ ...s, addressLine1: e.target.value }))}
                className={adminInputClass}
                placeholder="123 Main St"
                autoComplete="street-address"
              />
            </div>

            <div>
              <label
                htmlFor="org-city"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                City
              </label>
              <input
                id="org-city"
                value={form.city}
                onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                className={adminInputClass}
                placeholder="Berkeley"
                autoComplete="address-level2"
              />
            </div>

            <div>
              <label
                htmlFor="org-state"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                State
              </label>
              <input
                id="org-state"
                value={form.state}
                onChange={(e) => setForm((s) => ({ ...s, state: e.target.value }))}
                className={adminInputClass}
                placeholder="CA"
                autoComplete="address-level1"
              />
            </div>

            <div>
              <label
                htmlFor="org-postal"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                ZIP / postal code
              </label>
              <input
                id="org-postal"
                value={form.postalCode}
                onChange={(e) => setForm((s) => ({ ...s, postalCode: e.target.value }))}
                className={adminInputClass}
                placeholder="94704"
                autoComplete="postal-code"
              />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

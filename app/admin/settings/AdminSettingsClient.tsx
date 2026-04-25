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
  buildOrganizationCardThumbnailPath,
  buildOrganizationProfilePhotoPath,
  deleteFile,
  getDownloadUrl,
  uploadFile,
  validateOrganizationCardThumbnailFile,
  validateOrganizationProfilePhotoFile,
} from "@/app/lib/firebase/storage";
import { OrganizationCardThumbnailField } from "@/components/organization/OrganizationCardThumbnailField";
import { OrganizationProfilePhotoField } from "@/components/organization/OrganizationProfilePhotoField";
import { getOrganizationCardThumbnailStoragePath } from "@/lib/organization/organizationCardThumbnailPath";
import { getOrganizationProfilePhotoStoragePath } from "@/lib/organization/organizationProfilePhotoPath";
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
  const [initialProfilePhotoPath, setInitialProfilePhotoPath] = useState("");
  const [profilePhotoResolvedUrl, setProfilePhotoResolvedUrl] = useState("");
  const [selectedProfilePhotoFile, setSelectedProfilePhotoFile] = useState<File | null>(null);
  const [removeProfilePhoto, setRemoveProfilePhoto] = useState(false);
  const [hadLegacyThumbnailFirestoreField, setHadLegacyThumbnailFirestoreField] = useState(false);
  const [initialCardThumbnailPath, setInitialCardThumbnailPath] = useState("");
  const [cardThumbnailResolvedUrl, setCardThumbnailResolvedUrl] = useState("");
  const [selectedCardThumbnailFile, setSelectedCardThumbnailFile] = useState<File | null>(null);
  const [removeCardThumbnail, setRemoveCardThumbnail] = useState(false);

  useEffect(() => {
    if (!organizationId) {
      setOrganization(null);
      setInitialForm(null);
      setInitialProfilePhotoPath("");
      setProfilePhotoResolvedUrl("");
      setSelectedProfilePhotoFile(null);
      setRemoveProfilePhoto(false);
      setHadLegacyThumbnailFirestoreField(false);
      setInitialCardThumbnailPath("");
      setCardThumbnailResolvedUrl("");
      setSelectedCardThumbnailFile(null);
      setRemoveCardThumbnail(false);
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
      const rawOrg = data as Organization & { thumbnailStoragePath?: string };
      const photoPath = getOrganizationProfilePhotoStoragePath(rawOrg) ?? "";
      setInitialProfilePhotoPath(photoPath);
      setInitialCardThumbnailPath(getOrganizationCardThumbnailStoragePath(rawOrg) ?? "");
      setHadLegacyThumbnailFirestoreField(
        Boolean(rawOrg.thumbnailStoragePath?.trim()),
      );
      setSelectedProfilePhotoFile(null);
      setRemoveProfilePhoto(false);
      setSelectedCardThumbnailFile(null);
      setRemoveCardThumbnail(false);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  useEffect(() => {
    const path = getOrganizationProfilePhotoStoragePath(organization ?? undefined);
    if (!path || removeProfilePhoto) {
      setProfilePhotoResolvedUrl("");
      return;
    }
    let cancelled = false;
    void getDownloadUrl(path)
      .then((u) => {
        if (!cancelled) setProfilePhotoResolvedUrl(u);
      })
      .catch(() => {
        if (!cancelled) setProfilePhotoResolvedUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [organization, removeProfilePhoto]);

  useEffect(() => {
    const path = getOrganizationCardThumbnailStoragePath(
      organization as Organization & { thumbnailStoragePath?: string },
    );
    if (!path || removeCardThumbnail) {
      setCardThumbnailResolvedUrl("");
      return;
    }
    let cancelled = false;
    void getDownloadUrl(path)
      .then((u) => {
        if (!cancelled) setCardThumbnailResolvedUrl(u);
      })
      .catch(() => {
        if (!cancelled) setCardThumbnailResolvedUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [organization, removeCardThumbnail]);

  const dirty = useMemo(() => {
    if (!initialForm) return false;
    const formDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
    const photoDirty =
      Boolean(selectedProfilePhotoFile) ||
      (removeProfilePhoto && Boolean(initialProfilePhotoPath));
    const cardDirty =
      Boolean(selectedCardThumbnailFile) ||
      (removeCardThumbnail && Boolean(initialCardThumbnailPath));
    return formDirty || photoDirty || cardDirty;
  }, [
    form,
    initialForm,
    selectedProfilePhotoFile,
    removeProfilePhoto,
    initialProfilePhotoPath,
    selectedCardThumbnailFile,
    removeCardThumbnail,
    initialCardThumbnailPath,
  ]);

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

    const orgWithLegacy = organization as Organization & { thumbnailStoragePath?: string };
    const existingPhotoPath =
      getOrganizationProfilePhotoStoragePath(organization) ?? "";
    const existingCardPath = getOrganizationCardThumbnailStoragePath(orgWithLegacy) ?? "";

    let uploadedPhotoPath = "";
    let nextPhotoPath: string | undefined = undefined;
    if (removeProfilePhoto) {
      nextPhotoPath = undefined;
    } else if (selectedProfilePhotoFile) {
      const photoErr = validateOrganizationProfilePhotoFile(selectedProfilePhotoFile);
      if (photoErr) {
        toast.error(photoErr);
        return;
      }
      const uploadPath = buildOrganizationProfilePhotoPath(
        organizationId,
        selectedProfilePhotoFile.name,
      );
      try {
        await uploadFile(uploadPath, selectedProfilePhotoFile, {
          contentType: selectedProfilePhotoFile.type || "image/jpeg",
        });
        uploadedPhotoPath = uploadPath;
        nextPhotoPath = uploadPath;
      } catch (uploadErr) {
        const msg =
          uploadErr instanceof Error
            ? uploadErr.message
            : "Could not upload organization profile photo. Deploy updated Storage rules (`organizations/.../profile`) if you see permission errors.";
        toast.error(msg);
        return;
      }
    }

    let uploadedCardPath = "";
    let nextCardPath: string | undefined = undefined;
    if (removeCardThumbnail) {
      nextCardPath = undefined;
    } else if (selectedCardThumbnailFile) {
      const cardErr = validateOrganizationCardThumbnailFile(selectedCardThumbnailFile);
      if (cardErr) {
        toast.error(cardErr);
        return;
      }
      const cardUploadPath = buildOrganizationCardThumbnailPath(
        organizationId,
        selectedCardThumbnailFile.name,
      );
      try {
        await uploadFile(cardUploadPath, selectedCardThumbnailFile, {
          contentType: selectedCardThumbnailFile.type || "image/jpeg",
        });
        uploadedCardPath = cardUploadPath;
        nextCardPath = cardUploadPath;
      } catch (uploadErr) {
        const msg =
          uploadErr instanceof Error
            ? uploadErr.message
            : "Could not upload home card image. Deploy Storage rules for `organizations/.../thumbnail` if you see permission errors.";
        toast.error(msg);
        if (uploadedPhotoPath) {
          void deleteFile(uploadedPhotoPath).catch(() => undefined);
        }
        return;
      }
    }

    const photoPayload: Record<string, unknown> = {};
    if (removeProfilePhoto) {
      photoPayload.profilePhotoPath = deleteField();
    } else if (selectedProfilePhotoFile && nextPhotoPath) {
      photoPayload.profilePhotoPath = nextPhotoPath;
    }

    const cardPayload: Record<string, unknown> = {};
    if (removeCardThumbnail) {
      cardPayload.cardThumbnailPath = deleteField();
    } else if (selectedCardThumbnailFile && nextCardPath) {
      cardPayload.cardThumbnailPath = nextCardPath;
    }

    const legacyPayload: Record<string, unknown> = {};
    if (hadLegacyThumbnailFirestoreField || removeCardThumbnail) {
      legacyPayload.thumbnailStoragePath = deleteField();
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
        ...photoPayload,
        ...cardPayload,
        ...legacyPayload,
        updatedAt: dateToTimestamp(new Date()),
      });

      if (
        existingPhotoPath &&
        (removeProfilePhoto ||
          (nextPhotoPath && existingPhotoPath !== nextPhotoPath))
      ) {
        void deleteFile(existingPhotoPath).catch(() => undefined);
      }
      if (
        existingCardPath &&
        (removeCardThumbnail ||
          (nextCardPath && existingCardPath !== nextCardPath))
      ) {
        void deleteFile(existingCardPath).catch(() => undefined);
      }

      const nextPhotoStored = removeProfilePhoto
        ? undefined
        : nextPhotoPath ?? getOrganizationProfilePhotoStoragePath(organization);
      const nextCardStored = removeCardThumbnail
        ? undefined
        : nextCardPath ?? getOrganizationCardThumbnailStoragePath(orgWithLegacy);
      const nextOrganization: Organization = {
        ...organization,
        name,
        organizationType: form.organizationType || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        website: website || undefined,
        profilePhotoPath: nextPhotoStored,
        cardThumbnailPath: nextCardStored,
      };
      const nextForm = formFromOrganization(nextOrganization);
      setOrganization(nextOrganization);
      setInitialForm(nextForm);
      setForm(nextForm);
      setInitialProfilePhotoPath(getOrganizationProfilePhotoStoragePath(nextOrganization) ?? "");
      setInitialCardThumbnailPath(
        getOrganizationCardThumbnailStoragePath(
          nextOrganization as Organization & { thumbnailStoragePath?: string },
        ) ?? "",
      );
      setSelectedProfilePhotoFile(null);
      setRemoveProfilePhoto(false);
      setSelectedCardThumbnailFile(null);
      setRemoveCardThumbnail(false);
      setHadLegacyThumbnailFirestoreField(false);
      toast.success("Organization updated.");
    } catch (err) {
      if (uploadedPhotoPath) {
        void deleteFile(uploadedPhotoPath).catch(() => undefined);
      }
      if (uploadedCardPath) {
        void deleteFile(uploadedCardPath).catch(() => undefined);
      }
      toast.error(err instanceof Error ? err.message : "Failed to update organization.");
    } finally {
      setSaving(false);
    }
  }

  function handleSelectCardThumbnail(file: File | null) {
    if (!file) {
      setSelectedCardThumbnailFile(null);
      return;
    }
    const err = validateOrganizationCardThumbnailFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setSelectedCardThumbnailFile(file);
    setRemoveCardThumbnail(false);
  }

  function handleSelectProfilePhoto(file: File | null) {
    if (!file) {
      setSelectedProfilePhotoFile(null);
      return;
    }
    const err = validateOrganizationProfilePhotoFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setSelectedProfilePhotoFile(file);
    setRemoveProfilePhoto(false);
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
                  setSelectedProfilePhotoFile(null);
                  setRemoveProfilePhoto(false);
                  setSelectedCardThumbnailFile(null);
                  setRemoveCardThumbnail(false);
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
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Logo
              </label>
              <div className="flex flex-wrap items-end gap-4">
                <OrganizationProfilePhotoField
                  organizationName={form.name.trim() || organization.name}
                  currentPhotoUrl={!removeProfilePhoto ? profilePhotoResolvedUrl : undefined}
                  selectedFile={selectedProfilePhotoFile}
                  disabled={saving}
                  onSelectFile={handleSelectProfilePhoto}
                  onClearSelection={() => setSelectedProfilePhotoFile(null)}
                  onRemoveCurrent={() => {
                    setRemoveProfilePhoto(true);
                    setSelectedProfilePhotoFile(null);
                  }}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Shown in the portal organization picker and admin header.
              </p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Home card image
              </label>
              <OrganizationCardThumbnailField
                organizationName={form.name.trim() || organization.name}
                currentImageUrl={!removeCardThumbnail ? cardThumbnailResolvedUrl : undefined}
                currentStoragePath={
                  !removeCardThumbnail
                    ? getOrganizationCardThumbnailStoragePath(
                        organization as Organization & { thumbnailStoragePath?: string },
                      )
                    : undefined
                }
                selectedFile={selectedCardThumbnailFile}
                disabled={saving}
                onSelectFile={handleSelectCardThumbnail}
                onClearSelection={() => setSelectedCardThumbnailFile(null)}
                onRemoveCurrent={() => {
                  setRemoveCardThumbnail(true);
                  setSelectedCardThumbnailFile(null);
                }}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Wide image on your home organization cards and admin org tiles.
              </p>
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

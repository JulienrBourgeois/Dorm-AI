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

  useEffect(() => {
    if (!organizationId) {
      setOrganization(null);
      setInitialForm(null);
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
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const dirty = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

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
        updatedAt: dateToTimestamp(new Date()),
      });

      const nextOrganization: Organization = {
        ...organization,
        name,
        organizationType: form.organizationType || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        website: website || undefined,
      };
      const nextForm = formFromOrganization(nextOrganization);
      setOrganization(nextOrganization);
      setInitialForm(nextForm);
      setForm(nextForm);
      toast.success("Organization updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update organization.");
    } finally {
      setSaving(false);
    }
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
                onClick={() => initialForm && setForm(initialForm)}
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

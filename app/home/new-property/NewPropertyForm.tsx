"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { where } from "firebase/firestore";
import { toast } from "sonner";
import { BackButton } from "@/components/auth/ui";
import { auth } from "@/app/lib/firebase/app";
import {
  addDocument,
  setDocument,
  updateDocument,
  COLLECTIONS,
  dateToTimestamp,
  queryCollection,
} from "@/app/lib/firebase/firestore";
import type { OrganizationType } from "@/types/dorm";
import { ORGANIZATION_TYPE_OPTIONS } from "@/lib/organizationDisplay";
import { triggerOrganizationCreatedEmail } from "@/lib/email/triggerFromClient";
import { parseBuildingsCsv } from "@/lib/csv/parseBuildingsCsv";
import { parseInspectorInviteCsv, parseTenantInviteCsv } from "@/lib/csv/parseInviteCsv";
import { createInspectorInvite, createTenantInvite } from "@/lib/admin/membershipInvites";
import type { Building, WithId } from "@/types";

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function normalizeWebsiteInput(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    new URL(withProto);
    return withProto;
  } catch {
    return null;
  }
}

const labelClass =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const groupTitleClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

const inputClass =
  "h-[52px] w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 text-base text-foreground outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-950";

const selectClass = [
  inputClass,
  "cursor-pointer appearance-none pr-11",
  "hover:border-zinc-300 dark:hover:border-zinc-600",
].join(" ");

const BUILDINGS_CSV_TEMPLATE = `code,name,address
BERK,Berkeley Hall,123 Campus Drive
`;

const TENANT_CSV_TEMPLATE = `name,email,room
Jane Doe,jane@example.com,101A
`;

const INSPECTOR_CSV_TEMPLATE = `name,email,building
Alex Smith,alex@example.com,BERK
`;

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function SelectChevron() {
  return (
    <span
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
      aria-hidden
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function NewPropertyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organizationType, setOrganizationType] = useState<OrganizationType | "">("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showBulkSetup, setShowBulkSetup] = useState(false);
  const [buildingRows, setBuildingRows] = useState<ReturnType<typeof parseBuildingsCsv>["rows"]>([]);
  const [tenantRows, setTenantRows] = useState<ReturnType<typeof parseTenantInviteCsv>["rows"]>([]);
  const [inspectorRows, setInspectorRows] = useState<ReturnType<typeof parseInspectorInviteCsv>["rows"]>([]);

  async function onBuildingsFile(file: File | null) {
    if (!file) {
      setBuildingRows([]);
      return;
    }
    const text = await file.text();
    const parsed = parseBuildingsCsv(text);
    setBuildingRows(parsed.rows);
    if (parsed.issues.length > 0) {
      toast.warning(`Buildings CSV has ${parsed.issues.length} issue(s); valid rows will still import.`);
    }
  }

  async function onTenantsFile(file: File | null) {
    if (!file) {
      setTenantRows([]);
      return;
    }
    const text = await file.text();
    const parsed = parseTenantInviteCsv(text);
    setTenantRows(parsed.rows);
    if (parsed.errors.length > 0) {
      toast.warning(`Tenants CSV has ${parsed.errors.length} issue(s); valid rows will still import.`);
    }
  }

  async function onInspectorsFile(file: File | null) {
    if (!file) {
      setInspectorRows([]);
      return;
    }
    const text = await file.text();
    const parsed = parseInspectorInviteCsv(text);
    setInspectorRows(parsed.rows);
    if (parsed.errors.length > 0) {
      toast.warning(`Inspectors CSV has ${parsed.errors.length} issue(s); valid rows will still import.`);
    }
  }

  async function runOptionalBulkSetup(organizationId: string) {
    let buildingCreated = 0;
    let tenantInvited = 0;
    let inspectorInvited = 0;
    const failures: string[] = [];

    if (buildingRows.length > 0) {
      const existingCodes = new Set<string>();
      const now = dateToTimestamp(new Date());
      for (const row of buildingRows) {
        if (existingCodes.has(row.code)) continue;
        existingCodes.add(row.code);
        await addDocument(COLLECTIONS.buildings, {
          organizationId,
          name: row.name,
          code: row.code,
          address: row.address,
          createdAt: now,
          updatedAt: now,
        });
        buildingCreated++;
      }
    }

    let buildingsForLookup: Array<WithId<Building>> = [];
    if (inspectorRows.some((r) => (r.buildingCode ?? "").trim().length > 0)) {
      const buildingsSnap = await queryCollection(
        COLLECTIONS.buildings,
        where("organizationId", "==", organizationId),
      );
      buildingsForLookup = buildingsSnap.docs.map((d) => ({ ...(d.data() as Building), id: d.id }));
    }

    for (const row of tenantRows) {
      try {
        await createTenantInvite({
          organizationId,
          name: row.name,
          email: row.email,
          roomId: null,
          currentUser: auth.currentUser,
        });
        tenantInvited++;
      } catch (err) {
        failures.push(
          `Tenant ${row.email}: ${err instanceof Error ? err.message : "Failed to invite."}`,
        );
      }
    }

    for (const row of inspectorRows) {
      let buildingId: string | null = null;
      if ((row.buildingCode ?? "").trim()) {
        const key = row.buildingCode!.trim().toLowerCase();
        const match = buildingsForLookup.find((b) => b.code.trim().toLowerCase() === key);
        if (!match) {
          failures.push(`Inspector ${row.email}: building code "${row.buildingCode}" not found.`);
          continue;
        }
        buildingId = match.id;
      }
      try {
        await createInspectorInvite({
          organizationId,
          name: row.name,
          email: row.email,
          buildingId,
          currentUser: auth.currentUser,
        });
        inspectorInvited++;
      } catch (err) {
        failures.push(
          `Inspector ${row.email}: ${err instanceof Error ? err.message : "Failed to invite."}`,
        );
      }
    }

    if (tenantRows.some((r) => (r.roomNumber ?? "").trim().length > 0)) {
      toast.message("Tenant room assignments are skipped during org creation. You can assign rooms later.");
    }

    if (buildingCreated || tenantInvited || inspectorInvited) {
      toast.success(
        `Bulk setup: ${buildingCreated} buildings created, ${tenantInvited} tenants invited, ${inspectorInvited} inspectors invited.`,
      );
    }
    if (failures.length > 0) {
      toast.warning(`Bulk setup had ${failures.length} issue(s).`, {
        description: failures.slice(0, 3).join(" "),
      });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error("Session expired. Please sign in again.");
      router.replace("/signup");
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter an organization name.");
      return;
    }
    if (!organizationType) {
      toast.error("Please choose an organization type.");
      return;
    }
    const street = addressLine1.trim();
    const cityTrim = city.trim();
    const stateTrim = state.trim();
    const zipTrim = postalCode.trim();
    if (!street || !cityTrim || !stateTrim || !zipTrim) {
      toast.error("Please complete street, city, state, and ZIP.");
      return;
    }
    const websiteNorm = normalizeWebsiteInput(website);
    if (!websiteNorm) {
      toast.error("Please enter a valid website URL.");
      return;
    }
    const baseSlug = slugFromName(trimmedName) || "organization";
    const slugVal = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
    setSubmitting(true);
    try {
      const now = dateToTimestamp(new Date());
      const ref = await addDocument(COLLECTIONS.organizations, {
        name: trimmedName,
        slug: slugVal,
        organizationType,
        addressLine1: street,
        city: cityTrim,
        state: stateTrim,
        postalCode: zipTrim,
        website: websiteNorm,
        createdAt: now,
        updatedAt: now,
      });
      const organizationId = ref.id;
      await updateDocument(COLLECTIONS.organizations, organizationId, {
        id: organizationId,
      });
      const membershipId = `${user.uid}-${organizationId}`;
      await setDocument(COLLECTIONS.memberships, membershipId, {
        id: membershipId,
        userId: user.uid,
        organizationId,
        role: "ADMIN",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });
      toast.success("Organization created.");
      if (user) {
        void triggerOrganizationCreatedEmail(user, organizationId).catch(() => {});
      }
      if (showBulkSetup) {
        await runOptionalBulkSetup(organizationId);
      }
      const base = `/admin/dashboard?organizationId=${encodeURIComponent(organizationId)}`;
      router.push(base);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in-up-cascade flex w-full max-w-2xl flex-col items-center text-center">
      <BackButton
        onClick={() => router.push("/home/dashboard")}
        aria-label="Back to home"
      />

      <div className="mb-8 mt-2 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/20 lg:mb-10 lg:h-24 lg:w-24">
        <span className="text-3xl font-bold text-white lg:text-4xl">I</span>
      </div>

      <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl">
        Create an{" "}
        <span className="text-accent">organization.</span>
      </h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
        Add a property to your portfolio. You&apos;ll manage buildings, rooms, and inspections from the admin console.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className={`mt-10 flex w-full max-w-md flex-col gap-5 text-left ${submitting ? "pointer-events-none opacity-60" : ""}`}
        aria-busy={submitting}
      >
        <div>
          <label htmlFor="prop-name" className={labelClass}>
            Organization name
          </label>
          <input
            id="prop-name"
            type="text"
            name="organization"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. North Campus Housing"
            className={inputClass}
            disabled={submitting}
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor="prop-type" className={labelClass}>
            Type
          </label>
          <div className="relative">
            <select
              id="prop-type"
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value as OrganizationType | "")}
              className={selectClass}
              disabled={submitting}
            >
              <option value="" disabled>
                Select type…
              </option>
              {ORGANIZATION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div className="flex flex-col gap-3" role="group" aria-labelledby="prop-location-label">
          <p id="prop-location-label" className={groupTitleClass}>
            Location
          </p>
          <input
            id="prop-address"
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Street address"
            className={inputClass}
            disabled={submitting}
            autoComplete="street-address"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              id="prop-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className={inputClass}
              disabled={submitting}
              autoComplete="address-level2"
            />
            <input
              id="prop-state"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className={inputClass}
              disabled={submitting}
              autoComplete="address-level1"
            />
          </div>
          <input
            id="prop-zip"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="ZIP code"
            className={inputClass}
            disabled={submitting}
            autoComplete="postal-code"
          />
        </div>

        <div>
          <label htmlFor="prop-website" className={labelClass}>
            Website
          </label>
          <input
            id="prop-website"
            type="url"
            inputMode="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yoursite.com"
            className={inputClass}
            disabled={submitting}
            autoComplete="url"
          />
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={() => setShowBulkSetup((prev) => !prev)}
          className="mt-1 flex h-[52px] w-full items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white text-[15px] font-semibold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          {showBulkSetup ? "Hide bulk upload" : "Bulk upload"}
        </button>

        {showBulkSetup ? (
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Bulk setup (optional)</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Upload buildings plus invite tenants and inspectors while creating this organization.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Buildings CSV</p>
                <button
                  type="button"
                  onClick={() => downloadCsv("buildings-template.csv", BUILDINGS_CSV_TEMPLATE)}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Download template
                </button>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={submitting}
                onChange={(e) => void onBuildingsFile(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 file:mr-3 file:rounded-lg file:border file:border-zinc-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-zinc-800 hover:file:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:file:border-zinc-700 dark:file:bg-white dark:file:text-zinc-900"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{buildingRows.length} valid row(s)</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Tenants CSV</p>
                <button
                  type="button"
                  onClick={() => downloadCsv("tenant-invites-template.csv", TENANT_CSV_TEMPLATE)}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Download template
                </button>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={submitting}
                onChange={(e) => void onTenantsFile(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 file:mr-3 file:rounded-lg file:border file:border-zinc-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-zinc-800 hover:file:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:file:border-zinc-700 dark:file:bg-white dark:file:text-zinc-900"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{tenantRows.length} valid row(s)</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Inspectors CSV</p>
                <button
                  type="button"
                  onClick={() => downloadCsv("inspector-invites-template.csv", INSPECTOR_CSV_TEMPLATE)}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Download template
                </button>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={submitting}
                onChange={(e) => void onInspectorsFile(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 file:mr-3 file:rounded-lg file:border file:border-zinc-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-zinc-800 hover:file:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:file:border-zinc-700 dark:file:bg-white dark:file:text-zinc-900"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{inspectorRows.length} valid row(s)</p>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex h-[52px] w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0 dark:bg-white dark:text-black dark:shadow-white/10"
        >
          {submitting ? "Creating…" : "Create organization"}
        </button>
      </form>
    </div>
  );
}

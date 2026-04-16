"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, where, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import { BackButton } from "@/components/auth/ui";
import { auth, db } from "@/app/lib/firebase/app";
import {
  COLLECTIONS,
  addDocument,
  dateToTimestamp,
  queryCollection,
  setDocument,
  updateDocument,
} from "@/app/lib/firebase/firestore";
import type { OrganizationType } from "@/types/dorm";
import { ORGANIZATION_TYPE_OPTIONS } from "@/lib/organizationDisplay";
import { triggerOrganizationCreatedEmail } from "@/lib/email/triggerFromClient";
import {
  parseBulkSetupCsv,
  type ParseBulkSetupCsvResult,
} from "@/lib/csv/parseBulkSetupCsv";
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

const BULK_SETUP_CSV_TEMPLATE = `type,name,code,address,email,room,building,latitude,longitude
building,Berkeley Hall,BERK,123 Campus Drive,,,,37.8721,-122.2578
tenant,Jane Doe,,,jane@example.com,101A,,,
inspector,Alex Smith,,,alex@example.com,,BERK,,
`;

const BULK_BUILDING_BATCH_SIZE = 400;
const BULK_INVITE_CONCURRENCY = 3;

type BulkUploadData = {
  fileName: string;
  parsed: ParseBulkSetupCsvResult;
};

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
  const [bulkUpload, setBulkUpload] = useState<BulkUploadData | null>(null);
  const [showBulkLearnMore, setShowBulkLearnMore] = useState(false);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  async function onBulkSetupFile(file: File | null) {
    if (!file) {
      setBulkUpload(null);
      return;
    }
    const text = await file.text();
    const parsed = parseBulkSetupCsv(text);
    setBulkUpload({ fileName: file.name, parsed });
    if (parsed.issues.length > 0) {
      toast.warning(`Bulk CSV has ${parsed.issues.length} issue(s); valid rows will still import.`);
    }
    if (
      parsed.buildings.length === 0 &&
      parsed.tenants.length === 0 &&
      parsed.inspectors.length === 0
    ) {
      toast.error("No valid bulk setup rows found. Check your CSV structure.");
    }
  }

  async function runOptionalBulkSetup(organizationId: string, parsed: ParseBulkSetupCsvResult) {
    let buildingCreated = 0;
    let tenantInvited = 0;
    let inspectorInvited = 0;
    const failures: string[] = [];
    const now = dateToTimestamp(new Date());

    if (parsed.buildings.length > 0) {
      const buildingsCollection = collection(db, COLLECTIONS.buildings);
      for (let start = 0; start < parsed.buildings.length; start += BULK_BUILDING_BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = parsed.buildings.slice(start, start + BULK_BUILDING_BATCH_SIZE);
        for (const row of chunk) {
          const ref = doc(buildingsCollection);
          batch.set(ref, {
            organizationId,
            name: row.name,
            code: row.code,
            address: row.address,
            ...(row.latitude != null && row.longitude != null
              ? {
                  latitude: row.latitude,
                  longitude: row.longitude,
                }
              : {}),
            createdAt: now,
            updatedAt: now,
          });
        }
        await batch.commit();
        buildingCreated += chunk.length;
      }
    }

    let buildingsForLookup: Array<WithId<Building>> = [];
    if (parsed.inspectors.some((row) => (row.buildingCode ?? "").trim().length > 0)) {
      const buildingsSnap = await queryCollection(
        COLLECTIONS.buildings,
        where("organizationId", "==", organizationId),
      );
      buildingsForLookup = buildingsSnap.docs.map((d) => ({ ...(d.data() as Building), id: d.id }));
    }

    const inviteWithConcurrency = async (
      workers: number,
      tasks: Array<() => Promise<void>>,
    ) => {
      let nextTask = 0;
      const count = Math.min(workers, tasks.length);
      await Promise.all(
        Array.from({ length: count }, async () => {
          while (true) {
            const index = nextTask;
            nextTask += 1;
            if (index >= tasks.length) return;
            await tasks[index]!();
          }
        }),
      );
    };

    await inviteWithConcurrency(
      BULK_INVITE_CONCURRENCY,
      parsed.tenants.map((row) => async () => {
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
      }),
    );

    await inviteWithConcurrency(
      BULK_INVITE_CONCURRENCY,
      parsed.inspectors.map((row) => async () => {
        let buildingId: string | null = null;
        if ((row.buildingCode ?? "").trim()) {
          const key = row.buildingCode!.trim().toLowerCase();
          const match = buildingsForLookup.find((b) => b.code.trim().toLowerCase() === key);
          if (!match) {
            failures.push(`Inspector ${row.email}: building code "${row.buildingCode}" not found.`);
            return;
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
      }),
    );

    if (parsed.tenants.some((row) => (row.roomNumber ?? "").trim().length > 0)) {
      toast.message(
        "Tenant room assignments are skipped during org creation. You can assign rooms later.",
      );
    }

    if (parsed.issues.length > 0) {
      failures.push(...parsed.issues.slice(0, 20).map((issue) => `Line ${issue.line}: ${issue.message}`));
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
      if (
        bulkUpload &&
        (bulkUpload.parsed.buildings.length > 0 ||
          bulkUpload.parsed.tenants.length > 0 ||
          bulkUpload.parsed.inspectors.length > 0)
      ) {
        await runOptionalBulkSetup(organizationId, bulkUpload.parsed);
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

        <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Bulk setup (optional)</p>
            <button
              type="button"
              onClick={() => setShowBulkLearnMore(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Learn more about bulk upload CSV format"
              title="Learn more"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 17v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="8" r="1" fill="currentColor" />
                <path
                  d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Upload one combined CSV to create buildings and invite tenants and inspectors after organization creation.
          </p>
          <input
            ref={bulkFileInputRef}
            type="file"
            accept=".csv,text/csv"
            disabled={submitting}
            onChange={(e) => void onBulkSetupFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => bulkFileInputRef.current?.click()}
              disabled={submitting}
              className="rounded-xl border-2 border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Bulk upload CSV
            </button>
            <button
              type="button"
              onClick={() => downloadCsv("bulk-setup-template.csv", BULK_SETUP_CSV_TEMPLATE)}
              disabled={submitting}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Download template
            </button>
          </div>

          {bulkUpload ? (
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
              <p className="font-semibold text-zinc-800 dark:text-zinc-100">{bulkUpload.fileName}</p>
              <p className="mt-1">
                Valid rows: {bulkUpload.parsed.buildings.length + bulkUpload.parsed.tenants.length + bulkUpload.parsed.inspectors.length}
                {" "}(
                {bulkUpload.parsed.buildings.length} buildings, {bulkUpload.parsed.tenants.length} tenants,{" "}
                {bulkUpload.parsed.inspectors.length} inspectors)
              </p>
              {bulkUpload.parsed.issues.length > 0 ? (
                <p className="mt-1 text-amber-700 dark:text-amber-300">
                  {bulkUpload.parsed.issues.length} issue(s) found. Valid rows will still import.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {showBulkLearnMore ? (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowBulkLearnMore(false);
            }}
          >
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Bulk upload format</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Use one CSV with this header:{" "}
                <span className="font-mono">
                  type,name,code,address,email,room,building,latitude,longitude
                </span>
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300">
                <li>
                  <span className="font-mono">building</span> rows use:{" "}
                  <span className="font-mono">name,code,address,latitude,longitude</span>
                </li>
                <li><span className="font-mono">tenant</span> rows use: <span className="font-mono">name,email,room</span></li>
                <li><span className="font-mono">inspector</span> rows use: <span className="font-mono">name,email,building</span></li>
              </ul>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
{BULK_SETUP_CSV_TEMPLATE}
              </pre>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => downloadCsv("bulk-setup-template.csv", BULK_SETUP_CSV_TEMPLATE)}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Download template
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkLearnMore(false)}
                  className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
                >
                  Close
                </button>
              </div>
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

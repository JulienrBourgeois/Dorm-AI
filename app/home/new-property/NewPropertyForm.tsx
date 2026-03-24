"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackButton } from "@/components/auth/ui";
import { auth } from "@/app/lib/firebase/app";
import {
  addDocument,
  setDocument,
  updateDocument,
  COLLECTIONS,
  dateToTimestamp,
} from "@/app/lib/firebase/firestore";
import type { OrganizationType } from "@/types/dorm";
import { ORGANIZATION_TYPE_OPTIONS } from "@/lib/organizationDisplay";

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
      router.push(`/admin/dashboard?organizationId=${encodeURIComponent(organizationId)}`);
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
            required
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
              required
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
            required
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
              required
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
              required
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
            required
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
            required
          />
        </div>

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

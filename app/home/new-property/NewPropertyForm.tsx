"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { auth } from "@/app/lib/firebase/app";
import {
  addDocument,
  setDocument,
  COLLECTIONS,
  dateToTimestamp,
} from "@/app/lib/firebase/firestore";

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function NewPropertyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slug || slug === slugFromName(name)) setSlug(slugFromName(value));
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
      toast.error("Please enter a property name.");
      return;
    }
    const slugVal = slug.trim() || slugFromName(trimmedName);
    if (!slugVal) {
      toast.error("Please enter a property slug.");
      return;
    }
    setSubmitting(true);
    try {
      const now = dateToTimestamp(new Date());
      const ref = await addDocument(COLLECTIONS.universities, {
        name: trimmedName,
        slug: slugVal,
        createdAt: now,
        updatedAt: now,
      });
      const universityId = ref.id;
      await setDocument(
        COLLECTIONS.memberships,
        `${user.uid}-${universityId}`,
        {
          userId: user.uid,
          universityId,
          role: "ADMIN",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        }
      );
      toast.success("Property created.");
      router.push("/home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Link
        href="/home"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to home
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Create new property
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Add a property (university / housing org) to manage.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="prop-name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Property name
          </label>
          <input
            id="prop-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. North Campus Housing"
            className="h-12 w-full rounded-xl border-2 border-zinc-200 bg-white px-4 text-foreground outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="prop-slug" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Slug (URL-friendly id)
          </label>
          <input
            id="prop-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. north-campus"
            className="h-12 w-full rounded-xl border-2 border-zinc-200 bg-white px-4 font-mono text-foreground outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
            disabled={submitting}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-xl bg-accent font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create property"}
        </button>
      </form>
    </div>
  );
}

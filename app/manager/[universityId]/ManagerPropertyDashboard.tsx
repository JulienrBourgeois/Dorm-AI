"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDocumentData, COLLECTIONS } from "@/app/lib/firebase/firestore";
import type { University } from "@/types/dorm";
import { Loader } from "@/components/Loader";

export function ManagerPropertyDashboard({
  universityId: id,
}: {
  universityId: string;
}) {
  const [uni, setUni] = useState<University | null>(null);

  useEffect(() => {
    getDocumentData<University>(COLLECTIONS.universities, id).then(({ data }) =>
      setUni(data ?? null)
    );
  }, [id]);

  if (!uni) {
    return <Loader fullPage />;
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-10">
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {uni.name}
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">{uni.slug}</p>
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Dashboard for this property is coming next (buildings, rooms, inspections).
        </p>
      </main>
    </div>
  );
}

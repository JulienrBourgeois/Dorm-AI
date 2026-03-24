import type { Metadata } from "next";
import { Suspense } from "react";
import { TenantsLifecycleClient } from "./TenantsLifecycleClient";

export const metadata: Metadata = {
  title: "Tenants — Inspect AI",
};

export default function TenantsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center" aria-hidden />}>
      <TenantsLifecycleClient />
    </Suspense>
  );
}


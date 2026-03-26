import { Suspense } from "react";
import { TenantInspectionsClient } from "./TenantInspectionsClient";

function TenantPageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
      Loading tenant portal…
    </div>
  );
}

export default function TenantHomePage() {
  return (
    <Suspense fallback={<TenantPageFallback />}>
      <TenantInspectionsClient />
    </Suspense>
  );
}

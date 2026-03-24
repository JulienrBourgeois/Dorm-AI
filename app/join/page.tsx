import { Suspense } from "react";
import { JoinInviteClient } from "@/app/join/JoinInviteClient";
import { Loader } from "@/components/Loader";

export default function JoinInvitePage() {
  return (
    <Suspense fallback={<Loader fullPage message="Loading…" />}>
      <JoinInviteClient />
    </Suspense>
  );
}

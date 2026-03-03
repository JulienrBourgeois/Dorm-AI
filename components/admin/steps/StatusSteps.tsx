"use client";

import { Shell, AnimateStep, PrimaryButton, ShieldXIcon } from "@/components/admin/ui";
import type { AuthFunnelActions } from "@/types/admin/authFunnel";

export function CheckingAccessStep({ message }: { message: string }) {
  return (
    <Shell>
      <AnimateStep stepKey="checking-access">
        <div className="flex flex-col items-center gap-5 py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-200 border-t-accent dark:border-zinc-700 dark:border-t-accent" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{message}</p>
        </div>
      </AnimateStep>
    </Shell>
  );
}

export function AccessDeniedStep({ handleSignOutAndReset }: Pick<AuthFunnelActions, "handleSignOutAndReset">) {
  return (
    <Shell>
      <AnimateStep stepKey="access-denied">
        <ShieldXIcon className="text-red-400" />
        <h1 className="text-3xl font-bold tracking-tight">Access denied</h1>
        <p className="max-w-[320px] text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Your account doesn&apos;t have admin access. Contact your administrator to get the ADMIN role assigned.
        </p>
        <PrimaryButton onClick={handleSignOutAndReset}>Sign out</PrimaryButton>
      </AnimateStep>
    </Shell>
  );
}

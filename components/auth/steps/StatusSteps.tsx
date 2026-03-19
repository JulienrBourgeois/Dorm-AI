"use client";

import { Shell, AnimateStep } from "@/components/auth/ui";

export function LoadingStep({ message }: { message: string }) {
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

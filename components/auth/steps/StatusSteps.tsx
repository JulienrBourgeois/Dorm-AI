"use client";

import { Shell, AnimateStep } from "@/components/auth/ui";
import { Loader } from "@/components/Loader";

export function LoadingStep({ message }: { message: string }) {
  return (
    <Shell>
      <AnimateStep stepKey="checking-access">
        <div className="py-8">
          <Loader message={message} />
        </div>
      </AnimateStep>
    </Shell>
  );
}

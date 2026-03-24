import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthFunnel } from "./AdminAuthFunnel";

export const metadata: Metadata = {
  title: "Sign in — Property manager — Inspect AI",
  description: "Sign in for property managers and organization administrators.",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-[100dvh] w-full bg-white dark:bg-black" aria-hidden />}
    >
      <div className="animate-fade-in-up min-h-[100dvh] w-full">
        <AdminAuthFunnel />
      </div>
    </Suspense>
  );
}


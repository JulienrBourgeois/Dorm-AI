import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthFunnel } from "./AdminAuthFunnel";

export const metadata: Metadata = {
  title: "Sign in — Property manager — Dorm AI",
  description: "Sign in for property managers and organization administrators.",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" aria-hidden />}>
      <div className="animate-fade-in-up w-full">
        <AdminAuthFunnel />
      </div>
    </Suspense>
  );
}


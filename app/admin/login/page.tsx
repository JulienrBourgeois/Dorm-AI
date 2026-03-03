import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthFunnel } from "./AdminAuthFunnel";

export const metadata: Metadata = {
  title: "Admin Login — Dorm AI",
  description: "Sign in or create an admin account for Dorm AI.",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--color-page)]" aria-hidden />}>
      <div className="animate-fade-in-up w-full">
        <AdminAuthFunnel />
      </div>
    </Suspense>
  );
}

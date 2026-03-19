import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFunnel } from "./AuthFunnel";

export const metadata: Metadata = {
  title: "Sign Up — Dorm AI",
  description: "Create an account or log in to Dorm AI.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" aria-hidden />}>
      <div className="animate-fade-in-up w-full">
        <AuthFunnel />
      </div>
    </Suspense>
  );
}

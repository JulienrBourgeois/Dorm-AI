import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFunnel } from "./AuthFunnel";

export const metadata: Metadata = {
  title: "Sign Up — Inspect AI",
  description: "Create an account or log in to Inspect AI.",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-[100dvh] w-full bg-white dark:bg-black" aria-hidden />}
    >
      <div className="animate-fade-in-up min-h-[100dvh] w-full">
        <AuthFunnel />
      </div>
    </Suspense>
  );
}

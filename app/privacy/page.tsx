import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Inspect AI",
  description: "Placeholder privacy policy for Inspect AI (demo only).",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[100dvh] bg-white text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          ← Back to home
        </Link>

        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <strong>Demo only.</strong> This is a sample privacy policy for development and product
          previews. It is not legal advice, may be incomplete, and does not describe real data
          practices unless your deployment is configured to match it.
        </p>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">Privacy Policy (sample)</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: April 7, 2026 · Inspect AI
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              1. Overview
            </h2>
            <p className="mt-2">
              This placeholder describes how a fictional version of Inspect AI might handle
              information. Your actual product should be reviewed by qualified counsel before use in
              production.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              2. Information we might collect
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Account details (e.g. name, email) you provide when signing up</li>
              <li>Organization, property, and inspection data you enter in the app</li>
              <li>Technical data such as device type, browser, and approximate region from logs</li>
              <li>Communications you send to support (if enabled)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              3. How we might use it
            </h2>
            <p className="mt-2">
              Examples: operating the service, authentication, security, analytics, customer support,
              and complying with law where required. No commitment is made here—replace this with
              your real purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              4. Sharing
            </h2>
            <p className="mt-2">
              In a real policy you would list subprocessors, integrations, and legal disclosures.
              This sample says nothing binding.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              5. Retention & security
            </h2>
            <p className="mt-2">
              Placeholder text: data may be retained as long as your account is active and for a
              reasonable period afterward. Security measures should be described accurately for your
              stack (encryption, access controls, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              6. Your choices
            </h2>
            <p className="mt-2">
              Example rights: access, correction, deletion, export—only where applicable under law
              and your implementation. Insert real contact and process details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              7. Contact
            </h2>
            <p className="mt-2">
              For this demo, use your product&apos;s real support channel when you publish a final
              policy.
            </p>
          </section>
        </div>

        <p className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-500">
          <Link href="/terms" className="text-accent underline-offset-2 hover:underline">
            Terms of Use
          </Link>
        </p>
      </div>
    </div>
  );
}

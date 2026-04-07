import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — Inspect AI",
  description: "Placeholder terms of use for Inspect AI (demo only).",
};

export default function TermsOfUsePage() {
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
          <strong>Demo only.</strong> These terms are a non-binding sample for development and
          previews. They do not create a contract and are not a substitute for advice from a qualified
          attorney.
        </p>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">Terms of Use (sample)</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: April 7, 2026 · Inspect AI
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              1. Agreement to terms
            </h2>
            <p className="mt-2">
              By accessing or using Inspect AI in a demo environment, you acknowledge you have read
              this placeholder. A production deployment must publish enforceable terms acceptable to
              your organization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              2. The service
            </h2>
            <p className="mt-2">
              Inspect AI is described on the marketing site and in-app copy. Features, availability,
              and SLAs are not guaranteed by this sample document.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              3. Accounts & eligibility
            </h2>
            <p className="mt-2">
              Users may need valid invitations or admin approval. You are responsible for
              safeguarding credentials and for activity under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              4. Acceptable use
            </h2>
            <p className="mt-2">
              Examples of things to prohibit in real terms: illegal activity, harassment, attempting
              to breach security, scraping in violation of policy, or misusing personal data of
              others. Expand for your jurisdiction and product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              5. Content & data
            </h2>
            <p className="mt-2">
              Customers typically retain ownership of their data; the vendor receives a license to
              host and process it to run the service. Define IP, uploads, and AI-generated outputs
              properly in real terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              6. Disclaimers
            </h2>
            <p className="mt-2">
              THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” IN THIS SAMPLE—WITHOUT WARRANTIES OF
              ANY KIND, EXPRESS OR IMPLIED, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              7. Limitation of liability
            </h2>
            <p className="mt-2">
              Placeholder: cap liability, exclude consequential damages where allowed, and carve out
              exceptions required by law. Must be drafted for your entity and governing law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              8. Changes
            </h2>
            <p className="mt-2">
              We may update this sample text anytime. Production terms should describe notice and
              effective dates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              9. Governing law
            </h2>
            <p className="mt-2">
              Placeholder: specify state/country and venue. Do not copy this section without legal
              review.
            </p>
          </section>
        </div>

        <p className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-500">
          <Link href="/privacy" className="text-accent underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

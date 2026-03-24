import type { Metadata } from "next";
import Link from "next/link";
import { AppBrandReload } from "@/components/AppBrandReload";

export const metadata: Metadata = {
  title: "Inspect AI — Smart property inspections",
  description:
    "Streamline unit and common-area inspections, catch issues early, and manage your portfolio with AI-assisted workflows.",
};

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0 text-accent">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.12" />
      <path d="M6.5 10.5L9 13L14 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURES = [
  "Schedule and manage property inspections digitally",
  "Photo-documented checklists for every room",
  "AI-generated inspection summaries",
  "Role-based access for admins, inspectors, and tenants",
  "Real-time transparency on damages and charges",
  "Built for multi-organization scale from day one",
];
const LOGOS = [
  {
    name: "Berkeley Campus Housing",
    image: "/images/logos/berkeley.png",
  },
  {
    name: "Westwood Student Residences",
    image: "/images/logos/ucla.png",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-black">
      {/* Nav */}
      <header className="animate-fade-in flex w-full items-center justify-between px-6 py-5 lg:px-12">
        <AppBrandReload className="flex cursor-pointer items-center gap-3 rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" />
        <div className="flex items-center gap-3">
          <Link
            href="/signup?step=login-chooser"
            className="rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-black dark:shadow-white/10"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center px-6 pt-12 pb-16 sm:pt-20 lg:pt-24">
        <div className="animate-fade-in-up-cascade flex w-full max-w-2xl flex-col items-center text-center">
          <div className="mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/20 sm:h-20 sm:w-20 lg:mb-8 lg:h-[5.25rem] lg:w-[5.25rem]">
            <span className="text-2xl font-bold text-white sm:text-3xl lg:text-3xl">I</span>
          </div>

          <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-5xl">
            Property inspections,{" "}
            <span className="text-accent">simplified.</span>
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-500 sm:mt-5 sm:text-lg lg:mt-6 lg:text-lg lg:leading-relaxed dark:text-zinc-400">
            Move from paper forms and spreadsheets to a clean digital platform.
            Admins schedule, inspectors document, tenants stay informed — all in one place.
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center lg:mt-10">
            <Link
              href="/signup"
              className="flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 sm:h-[3.25rem] sm:px-10 sm:text-[15px] lg:px-11 dark:bg-white dark:text-black dark:shadow-white/10"
            >
              Get started free
            </Link>
            <Link
              href="/signup?step=login-chooser"
              className="flex h-12 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white px-8 text-sm font-semibold text-foreground transition-all hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 sm:h-[3.25rem] sm:px-10 sm:text-[15px] lg:px-11 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="animate-fade-in-up-delay mt-14 w-full max-w-2xl sm:mt-16 lg:mt-20">
          <ul className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 rounded-xl p-2 sm:gap-3 sm:p-2.5">
                <CheckIcon />
                <span className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="animate-fade-in border-t border-zinc-100 px-6 py-8 text-center dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} Inspect AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

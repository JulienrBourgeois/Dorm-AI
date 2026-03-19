import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dorm AI — Smart Dorm Inspections",
  description:
    "Streamline dorm room inspections, catch damages early, and manage your properties with AI-powered tools.",
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
  "Schedule and manage dorm inspections digitally",
  "Photo-documented checklists for every room",
  "AI-generated inspection summaries",
  "Role-based access for admins, inspectors, and tenants",
  "Real-time transparency on damages and charges",
  "Built for multi-campus scale from day one",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-black">
      {/* Nav */}
      <header className="flex w-full items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/15">
            <span className="text-sm font-bold text-white">D</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Dorm AI</span>
        </div>
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
      <main className="flex flex-1 flex-col items-center px-6 pt-16 pb-20 sm:pt-24 lg:pt-32">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/20 lg:mb-10 lg:h-24 lg:w-24">
            <span className="text-3xl font-bold text-white lg:text-4xl">D</span>
          </div>

          <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Dorm inspections,{" "}
            <span className="text-accent">simplified.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-500 lg:mt-7 lg:text-xl lg:leading-relaxed dark:text-zinc-400">
            Move from paper forms and spreadsheets to a clean digital platform.
            Admins schedule, inspectors document, tenants stay informed — all in one place.
          </p>

          <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center lg:mt-12">
            <Link
              href="/signup"
              className="flex h-[52px] items-center justify-center rounded-2xl bg-primary px-10 text-[15px] font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 lg:h-[56px] lg:px-12 lg:text-base dark:bg-white dark:text-black dark:shadow-white/10"
            >
              Get started free
            </Link>
            <Link
              href="/signup?step=login-chooser"
              className="flex h-[52px] items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white px-10 text-[15px] font-semibold text-foreground transition-all hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 lg:h-[56px] lg:px-12 lg:text-base dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 w-full max-w-3xl lg:mt-28">
          <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 rounded-xl p-3">
                <CheckIcon />
                <span className="text-sm leading-relaxed text-zinc-600 lg:text-[15px] dark:text-zinc-400">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-6 py-8 text-center dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} Dorm AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

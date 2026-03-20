"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { subscribeToAuthState, signOutUser } from "@/app/lib/firebase/auth";

type SidebarItem = {
  label: string;
  href: string;
  active?: boolean;
};

function TenantAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user: import("firebase/auth").User | null) => {
      if (!user) {
        router.replace("/signup?step=login-chooser");
        return;
      }
      setChecking(false);
    });
    return unsubscribe;
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" aria-live="polite">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
            Checking your sign-in…
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function SidebarLink({ item }: { item: SidebarItem }) {
  return (
    <a
      href={item.href}
      className={[
        "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        item.active
          ? "bg-sky-50 text-zinc-900 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-white dark:ring-sky-900/60"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60",
      ].join(" ")}
      aria-current={item.active ? "page" : undefined}
    >
      {item.label}
    </a>
  );
}

export default function TenantHomePage() {
  const router = useRouter();
  const sidebarItems: SidebarItem[] = [
    { label: "Home", href: "#home", active: true },
    { label: "Inbox", href: "#inbox" },
    { label: "Inspections", href: "#inspections" },
    { label: "Room info", href: "#room-info" },
    { label: "Settings", href: "#settings" },
  ];

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  return (
    <TenantAuthGate>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
                <div className="flex items-center gap-3 pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
                    <span className="text-sm font-bold text-white">T</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Tenant
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Self service
                    </div>
                  </div>
                </div>

                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <SidebarLink key={item.label} item={item} />
                  ))}
                </nav>

                <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </aside>

            <main className="min-w-0">
              <div className="rounded-2xl border border-sky-200 bg-sky-50/30 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Tenant · Home
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        No inspections available yet
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Read-only transparency when inspections are scheduled.
                  </div>
                </div>
              </div>

              <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
                <div id="home" className="sr-only" />

                <div className="grid gap-6 md:grid-cols-[1fr_360px]">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      No inspections available yet
                    </h2>
                    <p className="mt-2 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      Your building will schedule inspections here. Once there
                      are any, you will be able to open details, review
                      evidence, and see any room-condition notes.
                    </p>

                    <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Your room
                      </div>
                      <div className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        Cedar Hall · Room 214
                      </div>
                      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        For help: Building Office (Mon–Fri, 9–5)
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <a
                        href="#inspections"
                        className="flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
                      >
                        Open inspections
                      </a>
                      <a
                        href="#room-info"
                        className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Room information
                      </a>
                    </div>

                    <div
                      id="inspections"
                      className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300"
                    >
                      You currently have no scheduled or completed inspections.
                      Check back after your next maintenance window.
                    </div>

                    <div
                      id="room-info"
                      className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                    >
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Room-condition notes
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        Start by reviewing the latest notes on your room
                        condition. When inspections happen, findings will be
                        linked here.
                      </p>
                    </div>
                  </div>

                  <aside
                    id="inbox"
                    className="rounded-xl border border-sky-200 bg-sky-50/40 p-5 dark:border-sky-900/40 dark:bg-sky-950/20"
                  >
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Suggested setup order
                    </div>
                    <ol className="mt-3 space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-200 list-decimal">
                      <li>Confirm your room and contact info</li>
                      <li>Review room-condition notes</li>
                      <li>Check your inbox for inspection updates</li>
                      <li>Report any issues you notice (with photos later)</li>
                      <li>Review evidence when an inspection is completed</li>
                    </ol>

                    <div className="mt-5 rounded-xl bg-white/70 p-4 ring-1 ring-zinc-200 dark:bg-black/20 dark:ring-zinc-800">
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Next action
                      </div>
                      <a
                        href="#settings"
                        className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
                      >
                        Update tenant settings
                      </a>
                    </div>
                  </aside>
                </div>
              </section>

              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                This screen shows when you have no inspections scheduled yet for your assigned room.
              </p>

              <div id="settings" className="mt-4 hidden" aria-hidden="true" />
            </main>
          </div>
        </div>
      </div>
    </TenantAuthGate>
  );
}

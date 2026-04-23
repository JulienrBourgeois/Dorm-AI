"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AccountAvatar } from "./AccountAvatar";

export type AccountDrawerShortcut = { href: string; label: string };

type AccountDrawerProps = {
  displayName?: string;
  email?: string;
  photoUrl?: string;
  shortcuts?: AccountDrawerShortcut[];
  onSignOut: () => void | Promise<void>;
  /** Extra classes for the round trigger button (e.g. dark headers). */
  triggerClassName?: string;
};

const PANEL_Z = 100_000;
const BACKDROP_Z = 99_999;

export function AccountDrawer({
  displayName,
  email,
  photoUrl,
  shortcuts = [],
  onSignOut,
  triggerClassName,
}: AccountDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuEntered, setMenuEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const isClosingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finishClose = useCallback(() => {
    isClosingRef.current = false;
    setMenuVisible(false);
    setMenuEntered(false);
    setIsClosing(false);
  }, []);

  const openMenu = useCallback(() => {
    isClosingRef.current = false;
    setIsClosing(false);
    setMenuEntered(false);
    setMenuVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMenuEntered(true));
    });
  }, []);

  const closeMenu = useCallback(() => {
    isClosingRef.current = true;
    setIsClosing(true);
    setMenuEntered(false);
  }, []);

  useEffect(() => {
    if (!menuVisible || menuEntered || !isClosing) return;
    const id = window.setTimeout(finishClose, 360);
    return () => window.clearTimeout(id);
  }, [menuVisible, menuEntered, isClosing, finishClose]);

  useEffect(() => {
    if (!menuVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuVisible, closeMenu]);

  useEffect(() => {
    if (menuVisible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuVisible]);

  function handlePanelTransitionEnd(e: React.TransitionEvent<HTMLElement>) {
    if (e.propertyName !== "transform") return;
    if (isClosingRef.current) finishClose();
  }

  async function handleSignOut() {
    if (!window.confirm("Are you sure you want to sign out?")) {
      return;
    }
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
      closeMenu();
    }
  }

  const triggerBase =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-700";

  const backdropBlocksClicks = menuEntered;

  const portal =
    mounted && menuVisible ? (
      <>
        <button
          type="button"
          aria-label="Close account menu"
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
            menuEntered ? "opacity-100" : "opacity-0"
          } ${backdropBlocksClicks ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{ zIndex: BACKDROP_Z }}
          onClick={closeMenu}
        />
        <aside
          role="dialog"
          aria-modal
          aria-labelledby="account-drawer-title"
          className={`fixed inset-y-0 right-0 flex w-full max-w-md flex-col border-l-2 border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-lg ${
            menuEntered ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ zIndex: PANEL_Z }}
          onTransitionEnd={handlePanelTransitionEnd}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
            <h2 id="account-drawer-title" className="text-xl font-bold tracking-tight text-foreground">
              Account
            </h2>
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="border-b border-zinc-200 px-6 py-6 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <AccountAvatar
                displayName={displayName}
                email={email}
                photoUrl={photoUrl}
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl font-bold text-white shadow-md shadow-primary/20"
                imageClassName="h-full w-full object-cover"
                fallbackClassName="text-white opacity-95"
              />
              <div className="min-w-0 flex-1">
                {displayName ? (
                  <p className="truncate font-semibold text-foreground">{displayName}</p>
                ) : null}
                {email ? (
                  <p className="truncate text-sm font-medium text-zinc-600 dark:text-zinc-400">{email}</p>
                ) : !displayName ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Signed in</p>
                ) : null}
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-5 py-5 sm:px-6">
            {shortcuts.map((s) => (
              <Link
                key={s.href + s.label}
                href={s.href}
                onClick={closeMenu}
                className="rounded-xl border-2 border-transparent px-4 py-3.5 text-base font-semibold text-foreground transition-colors hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                {s.label}
              </Link>
            ))}
            {shortcuts.length > 0 ? (
              <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" role="separator" />
            ) : null}
            <Link
              href="/terms"
              onClick={closeMenu}
              className="rounded-xl border-2 border-transparent px-4 py-3.5 text-base font-semibold text-foreground transition-colors hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy"
              onClick={closeMenu}
              className="rounded-xl border-2 border-transparent px-4 py-3.5 text-base font-semibold text-foreground transition-colors hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Privacy Policy
            </Link>
          </nav>

          <div className="border-t border-zinc-200 p-5 dark:border-zinc-800 sm:px-6">
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-zinc-200 text-base font-semibold text-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-800 disabled:opacity-50 dark:border-zinc-700 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-200"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </aside>
      </>
    ) : null;

  return (
    <>
      <button
        type="button"
        aria-expanded={menuVisible}
        aria-haspopup="dialog"
        aria-label="Open account menu"
        onClick={menuVisible ? closeMenu : openMenu}
        className={`${triggerBase} ${triggerClassName ?? ""}`.trim()}
      >
        <AccountAvatar
          displayName={displayName}
          email={email}
          photoUrl={photoUrl}
          className="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
          imageClassName="h-full w-full object-cover"
          fallbackClassName="text-zinc-600 dark:text-zinc-300"
        />
      </button>

      {mounted && portal ? createPortal(portal, document.body) : null}
    </>
  );
}

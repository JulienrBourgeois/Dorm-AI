"use client";

import Link from "next/link";
import { AppBrandReload } from "@/components/AppBrandReload";

export function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10H5M5 10L10 5M5 10L10 15" />
    </svg>
  );
}

export function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7L13.03 12.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  );
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ShieldXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

/** Full-viewport layout aligned with the marketing home page (header + spacious main). */
export function Shell({
  children,
  headerEnd,
}: {
  children: React.ReactNode;
  /** e.g. profile menu when the user is signed in */
  headerEnd?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-black">
      <header className="animate-fade-in flex w-full shrink-0 items-center justify-between gap-4 px-6 py-5 lg:px-12">
        <AppBrandReload />
        {headerEnd ? <div className="flex shrink-0 items-center">{headerEnd}</div> : null}
      </header>
      <main className="flex flex-1 flex-col items-center px-6 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
        <div className="flex w-full max-w-[440px] flex-col">{children}</div>
      </main>
      <footer className="shrink-0 border-t border-zinc-100 px-6 py-8 text-center dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} Inspect AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export function AnimateStep({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <div key={stepKey} className="animate-fade-in-up-cascade flex w-full flex-col items-center gap-7">
      {children}
    </div>
  );
}

export function Footer() {
  return (
    <p className="animate-fade-in pt-6 text-center text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
      By using Inspect AI, you agree to our{" "}
      <a href="/terms" className="text-accent underline-offset-2 hover:underline">Terms of Use</a>
      {" "}and{" "}
      <a href="/privacy" className="text-accent underline-offset-2 hover:underline">Privacy Policy</a>.
    </p>
  );
}

const backControlClassName =
  "group flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-full border-2 border-accent/30 text-accent transition-all duration-200 hover:border-accent hover:bg-accent/5 active:scale-95";

export function BackButton({
  onClick,
  "aria-label": ariaLabel = "Go back",
}: {
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${backControlClassName} mb-2`}
      aria-label={ariaLabel}
    >
      <ArrowLeftIcon className="transition-transform duration-200 group-hover:-translate-x-0.5" />
    </button>
  );
}

export function BackLink({
  href,
  className,
  "aria-label": ariaLabel = "Go back",
}: {
  href: string;
  className?: string;
  "aria-label"?: string;
}) {
  const marginClass = className !== undefined ? "" : " mb-2";
  return (
    <Link
      href={href}
      className={`${backControlClassName}${marginClass}${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      <ArrowLeftIcon className="transition-transform duration-200 group-hover:-translate-x-0.5" />
    </Link>
  );
}

export function PrimaryButton({
  children,
  type = "button",
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed md:h-[54px] md:text-base dark:bg-white dark:text-black dark:shadow-white/10"
    >
      {children}
    </button>
  );
}

export function MethodButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-[56px] w-full items-center gap-4 rounded-2xl border-2 border-zinc-100 bg-white px-5 text-[15px] font-medium text-foreground shadow-sm transition-all duration-200 hover:border-zinc-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm md:h-[58px] md:text-base dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>
      <span className="flex-1 text-center pr-[24px]">{label}</span>
    </button>
  );
}

export function AuthInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  autoFocus,
  disabled,
  inputMode,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      disabled={disabled}
      inputMode={inputMode}
      className="h-12 w-full border-b-2 border-zinc-200 bg-transparent text-base text-foreground placeholder:text-zinc-400 outline-none transition-all duration-200 focus:border-accent disabled:opacity-40 md:h-13 md:text-[17px] dark:border-zinc-700 dark:placeholder:text-zinc-500 dark:focus:border-accent"
    />
  );
}

export function TextLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-semibold text-accent transition-colors duration-150 hover:text-accent-alt"
    >
      {children}
    </button>
  );
}

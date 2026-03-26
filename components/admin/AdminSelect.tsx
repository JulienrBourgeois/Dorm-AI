"use client";

import { useEffect, useRef, useState } from "react";

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export type AdminSelectOption = { value: string; label: string; disabled?: boolean };

type AdminSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  disabled?: boolean;
  size?: "md" | "sm";
  className?: string;
  "aria-label"?: string;
  id?: string;
};

const triggerMd =
  "flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border-2 border-zinc-200 bg-white px-3 text-left text-sm font-medium text-foreground shadow-sm transition hover:border-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600";

const triggerSm =
  "flex h-9 w-full min-w-[7.5rem] items-center justify-between gap-1.5 rounded-xl border-2 border-zinc-200 bg-white px-2.5 text-left text-xs font-medium text-foreground shadow-sm transition hover:border-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600";

export function AdminSelect({
  value,
  onChange,
  options,
  disabled = false,
  size = "md",
  className,
  "aria-label": ariaLabel,
  id,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? "—";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const empty = options.length === 0;
  const triggerClass = size === "sm" ? triggerSm : triggerMd;

  return (
    <div ref={rootRef} className={className ? `relative ${className}` : "relative"}>
      <button
        type="button"
        id={id}
        disabled={disabled || empty}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => {
          if (disabled || empty) return;
          setOpen((o) => !o);
        }}
        className={triggerClass}
      >
        <span className="min-w-0 flex-1 truncate">{empty ? "No options" : label}</span>
        <ChevronDown
          className={`shrink-0 text-zinc-500 transition-transform dark:text-zinc-400 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && !empty ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-xl border-2 border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {options.map((opt, idx) => {
            const optDisabled = Boolean(opt.disabled);
            return (
              <li key={`${idx}-${opt.value}-${opt.label}`} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  disabled={optDisabled}
                  onClick={() => {
                    if (optDisabled) return;
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full px-3 py-2.5 text-left font-medium transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 ${
                    size === "sm" ? "text-xs" : "text-sm"
                  } ${
                    opt.value === value
                      ? "bg-sky-50 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100"
                      : "text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

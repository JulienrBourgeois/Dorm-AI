"use client";

const NAVY = "#1e3a5f";

export function Loader({
  message,
  fullPage = false,
  className = "",
}: {
  message?: string;
  fullPage?: boolean;
  className?: string;
}) {
  const wrapperClass = fullPage
    ? "flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950"
    : "flex flex-col items-center justify-center gap-4";

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-100 dark:border-zinc-800"
        style={{ borderTopColor: NAVY }}
      />
      {message ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      ) : null}
    </div>
  );
}

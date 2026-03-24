"use client";

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
    ? "flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-white dark:bg-black"
    : "flex flex-col items-center justify-center gap-4";

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <div
        className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center"
        role="status"
        aria-label={message ?? "Loading"}
      >
        <div
          className="absolute inset-0 animate-spin rounded-full border-[3.5px] border-zinc-100 border-t-accent dark:border-zinc-800 dark:border-t-accent"
          aria-hidden
        />
        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/15">
          <span className="text-lg font-bold text-white">I</span>
        </div>
      </div>
      {message ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      ) : null}
    </div>
  );
}

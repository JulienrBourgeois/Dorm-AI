"use client";

type AppBrandReloadProps = {
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
};

export function AppBrandReload({
  className = "flex min-w-0 cursor-pointer items-center gap-3 rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
  iconClassName = "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/15",
  labelClassName = "text-lg font-semibold tracking-tight text-foreground",
}: AppBrandReloadProps) {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className={className}
      aria-label="Reload page"
    >
      <div className={iconClassName}>
        <span className="text-sm font-bold text-white">I</span>
      </div>
      <span className={labelClassName}>Inspect AI</span>
    </button>
  );
}

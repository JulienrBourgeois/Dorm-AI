"use client";

import { AppLogoMark } from "@/components/AppLogoMark";

type AppBrandReloadProps = {
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
};

export function AppBrandReload({
  className = "flex min-w-0 cursor-pointer items-center gap-3 rounded-xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
  iconClassName = "h-9 w-9 shrink-0",
  labelClassName = "text-lg font-semibold tracking-tight text-foreground",
}: AppBrandReloadProps) {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className={className}
      aria-label="Reload page"
    >
      <AppLogoMark
        className={iconClassName}
        wrapperClassName="rounded-xl shadow-md shadow-primary/15"
        alt=""
      />
      <span className={labelClassName}>Inspect AI</span>
    </button>
  );
}

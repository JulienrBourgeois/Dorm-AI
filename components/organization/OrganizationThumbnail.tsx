"use client";

import { useEffect, useState } from "react";
import { getDownloadUrl } from "@/app/lib/firebase/storage";

const variantClass: Record<
  "sm" | "md" | "hero" | "banner",
  { wrap: string; letter: string; img: string }
> = {
  sm: {
    wrap: "h-10 w-10 min-h-10 min-w-10 shrink-0 rounded-lg text-xs font-bold",
    letter: "relative z-[1]",
    img: "absolute inset-0 z-0 h-full w-full object-cover",
  },
  md: {
    wrap: "h-14 w-14 min-h-14 min-w-14 shrink-0 rounded-xl text-sm font-bold",
    letter: "relative z-[1]",
    img: "absolute inset-0 z-0 h-full w-full object-cover",
  },
  hero: {
    wrap: "h-[4.5rem] w-[4.5rem] min-h-[4.5rem] min-w-[4.5rem] shrink-0 rounded-3xl text-2xl font-bold shadow-xl shadow-primary/20 sm:h-20 sm:w-20 sm:min-h-20 sm:min-w-20 sm:text-3xl lg:h-[5.25rem] lg:w-[5.25rem] lg:min-h-[5.25rem] lg:min-w-[5.25rem] lg:text-3xl",
    letter: "relative z-[1]",
    img: "absolute inset-0 z-0 h-full w-full rounded-3xl object-cover",
  },
  banner: {
    wrap: "h-24 w-full min-h-24 rounded-t-xl text-lg font-bold sm:h-28",
    letter: "relative z-[1]",
    img: "absolute inset-0 z-0 h-full w-full rounded-t-xl object-cover",
  },
};

type OrganizationThumbnailProps = {
  name: string;
  thumbnailStoragePath?: string;
  /** When set, skips Storage fetch (parent-resolved or object preview URL). */
  thumbnailUrl?: string;
  variant: "sm" | "md" | "hero" | "banner";
  className?: string;
};

export function OrganizationThumbnail({
  name,
  thumbnailStoragePath,
  thumbnailUrl: urlProp,
  variant,
  className,
}: OrganizationThumbnailProps) {
  const [resolvedUrl, setResolvedUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const v = variantClass[variant];

  useEffect(() => {
    setFailed(false);
    if (urlProp?.trim()) {
      setResolvedUrl(urlProp.trim());
      return;
    }
    const path = thumbnailStoragePath?.trim();
    if (!path) {
      setResolvedUrl("");
      return;
    }
    let cancelled = false;
    void getDownloadUrl(path)
      .then((u) => {
        if (!cancelled) setResolvedUrl(u);
      })
      .catch(() => {
        if (!cancelled) setResolvedUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [thumbnailStoragePath, urlProp]);

  const showImg = Boolean(resolvedUrl) && !failed;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-secondary text-white ${v.wrap} ${className ?? ""}`.trim()}
    >
      {showImg ? (
        <img
          src={resolvedUrl}
          alt=""
          className={v.img}
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : null}
      {!showImg ? <span className={v.letter}>{initial}</span> : null}
    </div>
  );
}

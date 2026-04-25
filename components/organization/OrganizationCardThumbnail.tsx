"use client";

import { useEffect, useState } from "react";
import { getDownloadUrl } from "@/app/lib/firebase/storage";

type OrganizationCardThumbnailProps = {
  name: string;
  cardThumbnailPath?: string;
  /** When set, skips Storage fetch. */
  imageUrl?: string;
  className?: string;
  /** Merged onto the image (e.g. object-top to anchor crop from the top of the photo). */
  imageClassName?: string;
};

export function OrganizationCardThumbnail({
  name,
  cardThumbnailPath,
  imageUrl: urlProp,
  className,
  imageClassName,
}: OrganizationCardThumbnailProps) {
  const [resolvedUrl, setResolvedUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (urlProp?.trim()) {
      setResolvedUrl(urlProp.trim());
      return;
    }
    const path = cardThumbnailPath?.trim();
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
  }, [cardThumbnailPath, urlProp]);

  const showImg = Boolean(resolvedUrl) && !failed;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`relative flex aspect-[16/9] w-full min-h-[7.5rem] max-h-40 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white sm:min-h-[8.5rem] ${className ?? "rounded-t-xl"}`.trim()}
    >
      {showImg ? (
        <img
          src={resolvedUrl}
          alt=""
          className={`absolute inset-0 z-0 h-full w-full object-cover ${imageClassName ?? ""}`.trim()}
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : null}
      {!showImg ? <span className="relative z-[1]">{initial}</span> : null}
    </div>
  );
}

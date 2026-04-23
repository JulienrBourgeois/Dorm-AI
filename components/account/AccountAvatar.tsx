"use client";

import { useMemo, useState } from "react";

type AccountAvatarProps = {
  displayName?: string;
  email?: string;
  photoUrl?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function getAccountInitials(displayName?: string, email?: string): string {
  const n = displayName?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const e = email?.trim();
  if (e) return e.slice(0, 2).toUpperCase();
  return "";
}

function UserCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.8-4 14.2-4 16 0" />
    </svg>
  );
}

export function AccountAvatar({
  displayName,
  email,
  photoUrl,
  className,
  imageClassName,
  fallbackClassName,
}: AccountAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => getAccountInitials(displayName, email), [displayName, email]);
  const showImage = Boolean(photoUrl) && !failed;
  const showInitials = initials.length > 0;

  return (
    <div className={className}>
      {showImage ? (
        <img
          src={photoUrl}
          alt=""
          className={imageClassName}
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : showInitials ? (
        <span aria-hidden>{initials}</span>
      ) : (
        <UserCircleIcon className={fallbackClassName} />
      )}
    </div>
  );
}

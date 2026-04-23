"use client";

import { useEffect, useState } from "react";
import { AccountAvatar } from "./AccountAvatar";

type ProfilePhotoFieldProps = {
  displayName?: string;
  email?: string;
  currentPhotoUrl?: string;
  selectedFile?: File | null;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  onSelectFile: (file: File | null) => void;
  onClearSelection: () => void;
  onRemoveCurrent?: () => void;
};

export function ProfilePhotoField({
  displayName,
  email,
  currentPhotoUrl,
  selectedFile,
  disabled = false,
  label = "Profile picture",
  helperText,
  onSelectFile,
  onClearSelection,
  onRemoveCurrent,
}: ProfilePhotoFieldProps) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const effectivePhotoUrl = previewUrl || currentPhotoUrl || "";
  const selectedName = selectedFile?.name?.trim();
  const hasCurrentPhoto = Boolean(currentPhotoUrl);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/30 sm:flex-row sm:items-center">
        <AccountAvatar
          displayName={displayName}
          email={email}
          photoUrl={effectivePhotoUrl || undefined}
          className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-lg font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
          imageClassName="h-full w-full object-cover"
          fallbackClassName="text-zinc-600 dark:text-zinc-300"
        />
        <div className="min-w-0 flex-1 space-y-2">
          {selectedName ? (
            <p className="truncate text-sm text-zinc-600 dark:text-zinc-300">Selected: {selectedName}</p>
          ) : hasCurrentPhoto ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Current profile picture</p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Add a picture so teammates can recognize you.</p>
          )}
          {helperText ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p> : null}
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900">
              {hasCurrentPhoto || selectedName ? "Replace photo" : "Choose photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                disabled={disabled}
                className="hidden"
                onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {selectedName ? (
              <button
                type="button"
                onClick={onClearSelection}
                disabled={disabled}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Clear selected
              </button>
            ) : null}
            {!selectedName && hasCurrentPhoto && onRemoveCurrent ? (
              <button
                type="button"
                onClick={onRemoveCurrent}
                disabled={disabled}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-300 dark:hover:bg-red-950/20"
              >
                Remove current
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

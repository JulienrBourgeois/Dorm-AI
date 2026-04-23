"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AccountAvatar } from "./AccountAvatar";

type ProfilePhotoFieldProps = {
  displayName?: string;
  email?: string;
  currentPhotoUrl?: string;
  selectedFile?: File | null;
  disabled?: boolean;
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
  onSelectFile,
  onClearSelection,
  onRemoveCurrent,
}: ProfilePhotoFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const hasCurrentPhoto = Boolean(currentPhotoUrl);
  const showClear =
    Boolean(selectedFile) || (hasCurrentPhoto && Boolean(onRemoveCurrent));

  function handleClear(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (selectedFile) {
      onClearSelection();
    } else if (hasCurrentPhoto && onRemoveCurrent) {
      onRemoveCurrent();
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="relative inline-flex shrink-0">
      <label
        htmlFor={inputId}
        className={`group relative flex cursor-pointer items-center justify-center rounded-full outline-offset-2 focus-within:outline focus-within:outline-2 focus-within:outline-accent ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <AccountAvatar
          displayName={displayName}
          email={email}
          photoUrl={effectivePhotoUrl || undefined}
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-100 text-lg font-semibold text-zinc-800 transition-colors group-hover:border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:border-zinc-500"
          imageClassName="h-full w-full object-cover"
          fallbackClassName="text-zinc-600 dark:text-zinc-300"
        />
        <span className="sr-only">Upload profile photo</span>
      </label>
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        disabled={disabled}
        className="sr-only"
        onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
      />
      {showClear && !disabled ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute -right-0.5 -top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-zinc-600 text-white shadow-sm hover:bg-zinc-700 dark:border-zinc-950 dark:bg-zinc-500 dark:hover:bg-zinc-400"
          aria-label={selectedFile ? "Clear selected photo" : "Remove profile photo"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

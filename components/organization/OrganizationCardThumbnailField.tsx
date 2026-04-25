"use client";

import { useEffect, useId, useRef, useState } from "react";
import { OrganizationCardThumbnail } from "./OrganizationCardThumbnail";

type OrganizationCardThumbnailFieldProps = {
  organizationName: string;
  currentImageUrl?: string;
  currentStoragePath?: string;
  selectedFile?: File | null;
  disabled?: boolean;
  onSelectFile: (file: File | null) => void;
  onClearSelection: () => void;
  onRemoveCurrent?: () => void;
  /** Shown under the preview when `selectedFile` is set (default assumes “save” elsewhere). */
  selectedFileHint?: string;
};

export function OrganizationCardThumbnailField({
  organizationName,
  currentImageUrl,
  currentStoragePath,
  selectedFile,
  disabled = false,
  onSelectFile,
  onClearSelection,
  onRemoveCurrent,
  selectedFileHint = "New image selected — save to apply",
}: OrganizationCardThumbnailFieldProps) {
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

  const effectiveUrl = previewUrl || currentImageUrl || "";
  const hasCurrent = Boolean(currentStoragePath?.trim() && currentImageUrl);
  const showClear =
    Boolean(selectedFile) || (hasCurrent && Boolean(onRemoveCurrent));

  function handleClear(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (selectedFile) {
      onClearSelection();
    } else if (hasCurrent && onRemoveCurrent) {
      onRemoveCurrent();
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="relative w-full max-w-xl">
      <label
        htmlFor={inputId}
        className={`group block w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 outline-offset-2 focus-within:outline focus-within:outline-2 focus-within:outline-accent dark:border-zinc-600 ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <OrganizationCardThumbnail
          name={organizationName}
          cardThumbnailPath={previewUrl ? undefined : currentStoragePath}
          imageUrl={effectiveUrl || undefined}
          className="max-h-none min-h-[8rem] rounded-xl rounded-b-none border-0 sm:min-h-[9rem]"
        />
        <div className="border-t border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {selectedFile ? selectedFileHint : "Click to choose card image"}
        </div>
        <span className="sr-only">Upload home card image</span>
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
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-zinc-700 text-white shadow-md hover:bg-zinc-800 dark:border-zinc-950"
          aria-label={selectedFile ? "Clear selected image" : "Remove card image"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

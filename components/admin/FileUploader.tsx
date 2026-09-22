"use client";

import { useRef, useState } from "react";

export default function FileUploader({
  label,
  accept,
  hint,
  currentUrl,
  onFileChange,
  previewKind,
  onDurationDetected,
}: {
  label: string;
  accept: string;
  hint?: string;
  currentUrl?: string;
  onFileChange: (file: File | null) => void;
  previewKind?: "image" | "audio";
  onDurationDetected?: (seconds: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    setFileName(file?.name ?? null);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (previewKind === "image") {
      setPreviewUrl(objectUrl);
    }

    if (previewKind === "audio" && onDurationDetected) {
      const audio = new Audio(objectUrl);
      audio.addEventListener("loadedmetadata", () => {
        onDurationDetected(Math.round(audio.duration));
        URL.revokeObjectURL(objectUrl);
      });
    }
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:border-green hover:text-green"
        >
          Choose file
        </button>
        <span className="min-w-0 flex-1 truncate text-sm text-muted">
          {fileName ?? (currentUrl ? currentUrl.split("/").pop() : "No file selected")}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}

      {previewKind === "image" && (previewUrl || currentUrl) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl ?? currentUrl}
          alt="Preview"
          className="mt-3 h-24 w-24 rounded-lg border border-border object-cover"
        />
      )}
    </div>
  );
}

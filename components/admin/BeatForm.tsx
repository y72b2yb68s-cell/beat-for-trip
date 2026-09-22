"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Beat as PrismaBeat } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import Button from "@/components/ui/Button";
import FileUploader from "./FileUploader";

type Props = {
  beat?: PrismaBeat;
};

const GENRES = ["Trap", "Hip Hop", "Lo-Fi", "RnB", "Drill", "Pop", "Afrobeat", "Reggaeton"];

export default function BeatForm({ beat }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(beat);

  const [title, setTitle] = useState(beat?.title ?? "");
  const [slug, setSlug] = useState(beat?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(beat?.description ?? "");
  const [genre, setGenre] = useState(beat?.genre ?? GENRES[0]);
  const [bpm, setBpm] = useState(beat?.bpm?.toString() ?? "120");
  const [key, setKey] = useState(beat?.key ?? "");
  const [duration, setDuration] = useState(beat?.duration?.toString() ?? "");
  const [price, setPrice] = useState(beat?.price?.toString() ?? "");
  const [status, setStatus] = useState<"published" | "unpublished">(
    (beat?.status as "published" | "unpublished") ?? "unpublished"
  );

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [fullFile, setFullFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("description", description);
    formData.set("genre", genre);
    formData.set("bpm", bpm);
    formData.set("key", key);
    formData.set("duration", duration);
    formData.set("price", price);
    formData.set("status", status);
    if (coverFile) formData.set("cover", coverFile);
    if (previewFile) formData.set("preview", previewFile);
    if (fullFile) formData.set("full", fullFile);

    try {
      const res = await fetch(isEdit ? `/api/admin/beats/${beat!.id}` : "/api/admin/beats", {
        method: isEdit ? "PATCH" : "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.issues ?? {});
        showToast(data.error ?? "Something went wrong.", "error");
        setSubmitting(false);
        return;
      }

      showToast(isEdit ? "Beat updated." : "Beat created.", "success");
      router.push("/admin/beats");
      router.refresh();
    } catch {
      showToast("Network error. Please try again.", "error");
      setSubmitting(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none";
  const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-foreground">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className={fieldClass}
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title[0]}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Slug</label>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              required
              className={fieldClass}
            />
            {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug[0]}</p>}
          </div>

          <div>
            <label className={labelClass}>Genre</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className={fieldClass}>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Key</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. F#m"
              required
              className={fieldClass}
            />
            {errors.key && <p className="mt-1 text-xs text-red-400">{errors.key[0]}</p>}
          </div>

          <div>
            <label className={labelClass}>BPM</label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              required
              min={1}
              max={400}
              className={fieldClass}
            />
            {errors.bpm && <p className="mt-1 text-xs text-red-400">{errors.bpm[0]}</p>}
          </div>

          <div>
            <label className={labelClass}>Duration (seconds)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              min={1}
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-muted">Auto-filled from the preview file — adjustable.</p>
            {errors.duration && <p className="mt-1 text-xs text-red-400">{errors.duration[0]}</p>}
          </div>

          <div>
            <label className={labelClass}>Price (EUR)</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                €
              </span>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
                className={`${fieldClass} pl-8`}
              />
            </div>
            {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price[0]}</p>}
          </div>

          <div>
            <label className={labelClass}>Currency</label>
            <div className={`${fieldClass} flex items-center bg-white/5 text-muted`}>
              EUR — fixed, not editable
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={fieldClass}
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description[0]}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "published" | "unpublished")}
              className={fieldClass}
            >
              <option value="unpublished">Unpublished (hidden from catalog)</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-foreground">Files</h2>

        <div className="flex flex-col gap-6">
          <FileUploader
            label="Cover image"
            accept="image/*"
            hint="Square image recommended. Publicly visible."
            currentUrl={beat?.coverUrl || undefined}
            previewKind="image"
            onFileChange={setCoverFile}
          />

          <FileUploader
            label="Preview audio"
            accept="audio/*"
            hint="Short preview clip served publicly in the catalog."
            currentUrl={beat?.previewUrl || undefined}
            previewKind="audio"
            onFileChange={setPreviewFile}
            onDurationDetected={(seconds) => setDuration(String(seconds))}
          />

          <FileUploader
            label="Full beat audio"
            accept="audio/*"
            hint="Protected — only released to a buyer after payment is confirmed."
            currentUrl={beat?.fileKey ? "Full file on record" : undefined}
            onFileChange={setFullFile}
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Beat"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/beats")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

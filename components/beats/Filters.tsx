"use client";

import { useTranslations } from "next-intl";
import type { BeatFilters } from "@/lib/beat-filters";
import type { BeatSortOption } from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-green focus:outline-none";

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-shrink-0 flex-col gap-1.5", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
    </div>
  );
}

export default function Filters({
  filters,
  onChange,
  onReset,
  genres,
  keys,
  bounds,
}: {
  filters: BeatFilters;
  onChange: (filters: BeatFilters) => void;
  onReset: () => void;
  genres: string[];
  keys: string[];
  bounds: { bpmMin: number; bpmMax: number; priceMin: number; priceMax: number };
}) {
  const t = useTranslations("catalog");

  const sortOptions: { value: BeatSortOption; label: string }[] = [
    { value: "newest", label: t("newest") },
    { value: "price-asc", label: t("priceLowHigh") },
    { value: "price-desc", label: t("priceHighLow") },
  ];

  function set<K extends keyof BeatFilters>(key: K, value: BeatFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex items-end gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
      <Field label={t("sortBy")} className="w-36">
        <select
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value as BeatSortOption)}
          className={fieldClass}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("genre")} className="w-32">
        <select
          value={filters.genre}
          onChange={(e) => set("genre", e.target.value)}
          className={fieldClass}
        >
          <option value="all">{t("allGenres")}</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("key")} className="w-28">
        <select
          value={filters.key}
          onChange={(e) => set("key", e.target.value)}
          className={fieldClass}
        >
          <option value="all">{t("allKeys")}</option>
          {keys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </Field>

      <Field label={`${t("bpm")} min`} className="w-20">
        <input
          type="number"
          value={filters.bpmMin}
          min={bounds.bpmMin}
          max={filters.bpmMax}
          onChange={(e) => set("bpmMin", Number(e.target.value))}
          aria-label={t("minBpm")}
          className={fieldClass}
        />
      </Field>

      <Field label={`${t("bpm")} max`} className="w-20">
        <input
          type="number"
          value={filters.bpmMax}
          min={filters.bpmMin}
          max={bounds.bpmMax}
          onChange={(e) => set("bpmMax", Number(e.target.value))}
          aria-label={t("maxBpm")}
          className={fieldClass}
        />
      </Field>

      <Field label={`${t("price")} min`} className="w-24">
        <input
          type="number"
          value={filters.priceMin}
          min={bounds.priceMin}
          max={filters.priceMax}
          step={0.01}
          onChange={(e) => set("priceMin", Number(e.target.value))}
          aria-label={t("minPrice")}
          className={fieldClass}
        />
      </Field>

      <Field label={`${t("price")} max`} className="w-24">
        <input
          type="number"
          value={filters.priceMax}
          min={filters.priceMin}
          max={bounds.priceMax}
          step={0.01}
          onChange={(e) => set("priceMax", Number(e.target.value))}
          aria-label={t("maxPrice")}
          className={fieldClass}
        />
      </Field>

      <button
        type="button"
        onClick={onReset}
        className="flex-shrink-0 whitespace-nowrap rounded-lg border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-green hover:text-green"
      >
        {t("resetFilters")}
      </button>
    </div>
  );
}

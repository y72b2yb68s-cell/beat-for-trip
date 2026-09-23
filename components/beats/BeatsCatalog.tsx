"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Beat } from "@/lib/types";
import { applyFilters, defaultFilters, getFilterBounds, type BeatFilters } from "@/lib/beat-filters";
import SearchBar from "./SearchBar";
import Filters from "./Filters";
import BeatList from "./BeatList";
import Button from "@/components/ui/Button";

export type CatalogContent = {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  exclusiveCtaTitle?: string;
  exclusiveCtaSubtitle?: string;
  exclusiveCtaButton?: string;
};

export default function BeatsCatalog({ beats, content }: { beats: Beat[]; content?: CatalogContent }) {
  const t = useTranslations("catalog");
  const bounds = useMemo(() => getFilterBounds(beats), [beats]);
  const genres = useMemo(
    () => Array.from(new Set(beats.map((b) => b.genre))).sort(),
    [beats]
  );
  const keys = useMemo(() => Array.from(new Set(beats.map((b) => b.key))).sort(), [beats]);

  const [filters, setFilters] = useState<BeatFilters>(() => defaultFilters(beats));

  const results = useMemo(() => applyFilters(beats, filters), [beats, filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
          {content?.title || t("title")}
        </h1>
        {content?.subtitle && <p className="text-sm text-muted">{content.subtitle}</p>}
        <p className="text-sm text-muted">{t("beatsAvailable", { count: results.length })}</p>
      </div>

      <div className="mb-5">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters({ ...filters, search: v })}
          placeholder={content?.searchPlaceholder}
        />
      </div>

      <div className="mb-8">
        <Filters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters(beats))}
          genres={genres}
          keys={keys}
          bounds={bounds}
        />
      </div>

      <BeatList beats={results} />

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {content?.exclusiveCtaTitle || t("exclusiveCtaTitle")}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {content?.exclusiveCtaSubtitle || t("exclusiveCtaSubtitle")}
          </p>
        </div>
        <Button href="/exclusive-beat" size="sm" className="flex-shrink-0">
          {content?.exclusiveCtaButton || t("exclusiveCtaButton")}
        </Button>
      </div>
    </div>
  );
}

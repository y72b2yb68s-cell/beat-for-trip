"use client";

import { useMemo, useState } from "react";
import { CMS_PAGES, CMS_PAGE_LABELS, type SiteContentFieldDef } from "@/lib/site-content-registry";
import { localeNames, routing, type AppLocale } from "@/i18n/routing";
import { useToast } from "@/lib/toast-context";
import Button from "@/components/ui/Button";
import SectionCard from "./SectionCard";
import FieldInput from "./FieldInput";

export type SiteContentRow = {
  page: string;
  section: string;
  key: string;
  locale: string;
  value: string | null;
  draftValue: string | null;
};

type EntryState = { value: string; draftValue: string; savedDraftValue: string };

function rowKey(page: string, section: string, key: string, locale: string): string {
  return `${page}::${section}::${key}::${locale}`;
}

export default function WebsiteEditor({
  registry,
  initialContent,
}: {
  registry: SiteContentFieldDef[];
  initialContent: SiteContentRow[];
}) {
  const { showToast } = useToast();
  const [page, setPage] = useState<(typeof CMS_PAGES)[number]>("home");
  const [locale, setLocale] = useState<AppLocale>(routing.defaultLocale);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [entries, setEntries] = useState<Map<string, EntryState>>(() => {
    const map = new Map<string, EntryState>();
    for (const row of initialContent) {
      map.set(rowKey(row.page, row.section, row.key, row.locale), {
        value: row.value ?? "",
        draftValue: row.draftValue ?? row.value ?? "",
        savedDraftValue: row.draftValue ?? row.value ?? "",
      });
    }
    return map;
  });

  const pageFields = useMemo(() => registry.filter((f) => f.page === page), [registry, page]);
  const sections = useMemo(() => Array.from(new Set(pageFields.map((f) => f.section))), [pageFields]);

  function fieldLocale(def: SiteContentFieldDef): string {
    return def.localized ? locale : routing.defaultLocale;
  }

  function getEntry(def: SiteContentFieldDef): EntryState {
    const key = rowKey(def.page, def.section, def.key, fieldLocale(def));
    return entries.get(key) ?? { value: "", draftValue: "", savedDraftValue: "" };
  }

  function setDraft(def: SiteContentFieldDef, draftValue: string) {
    const key = rowKey(def.page, def.section, def.key, fieldLocale(def));
    setEntries((prev) => {
      const next = new Map(prev);
      const existing = next.get(key) ?? { value: "", draftValue: "", savedDraftValue: "" };
      next.set(key, { ...existing, draftValue });
      return next;
    });
  }

  const dirtyFieldsOnPage = pageFields.filter((def) => {
    const entry = getEntry(def);
    return entry.draftValue !== entry.savedDraftValue;
  });

  const unpublishedFieldsOnPage = pageFields.filter((def) => {
    const entry = getEntry(def);
    return entry.draftValue !== "" && entry.draftValue !== entry.value;
  });

  async function handleSaveDraft() {
    if (dirtyFieldsOnPage.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-draft",
          entries: dirtyFieldsOnPage.map((def) => ({
            page: def.page,
            section: def.section,
            key: def.key,
            locale: fieldLocale(def),
            draftValue: getEntry(def).draftValue,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Failed to save draft.", "error");
        return;
      }
      setEntries((prev) => {
        const next = new Map(prev);
        for (const def of dirtyFieldsOnPage) {
          const key = rowKey(def.page, def.section, def.key, fieldLocale(def));
          const entry = next.get(key)!;
          next.set(key, { ...entry, savedDraftValue: entry.draftValue });
        }
        return next;
      });
      showToast("Draft saved.", "success");
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (unpublishedFieldsOnPage.length === 0) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          entries: unpublishedFieldsOnPage.map((def) => ({
            page: def.page,
            section: def.section,
            key: def.key,
            locale: fieldLocale(def),
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Failed to publish.", "error");
        return;
      }
      setEntries((prev) => {
        const next = new Map(prev);
        for (const def of unpublishedFieldsOnPage) {
          const key = rowKey(def.page, def.section, def.key, fieldLocale(def));
          const entry = next.get(key)!;
          next.set(key, { ...entry, value: entry.draftValue, savedDraftValue: entry.draftValue });
        }
        return next;
      });
      showToast("Published.", "success");
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {CMS_PAGES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                page === p ? "bg-green-dim text-green" : "text-muted hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {CMS_PAGE_LABELS[p]}
            </button>
          ))}
        </div>

        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as AppLocale)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-green focus:outline-none"
        >
          {routing.locales.map((l) => (
            <option key={l} value={l}>
              {localeNames[l]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <SectionCard key={section} title={section}>
            {pageFields
              .filter((f) => f.section === section)
              .map((def) => (
                <FieldInput
                  key={`${def.section}::${def.key}`}
                  def={def}
                  value={getEntry(def).draftValue}
                  onChange={(v) => setDraft(def, v)}
                />
              ))}
          </SectionCard>
        ))}
      </div>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-xl">
        <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={saving || dirtyFieldsOnPage.length === 0}>
          {saving ? "Saving…" : `Save Draft${dirtyFieldsOnPage.length ? ` (${dirtyFieldsOnPage.length})` : ""}`}
        </Button>
        <Button type="button" onClick={handlePublish} disabled={publishing || unpublishedFieldsOnPage.length === 0}>
          {publishing ? "Publishing…" : `Publish${unpublishedFieldsOnPage.length ? ` (${unpublishedFieldsOnPage.length})` : ""}`}
        </Button>
        <p className="ml-auto text-xs text-muted">
          Editing <strong className="text-foreground">{CMS_PAGE_LABELS[page]}</strong> — {localeNames[locale]}
        </p>
      </div>
    </div>
  );
}

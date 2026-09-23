import { prisma } from "./db";
import { routing } from "@/i18n/routing";
import { getFieldDef, getPageFields } from "./site-content-registry";

export type SiteContentMode = "published" | "draft";

/** section -> key -> resolved string value (already locale/fallback-resolved). */
export type PageContentMap = Record<string, Record<string, string>>;

function resolveLocale(page: string, section: string, key: string, locale: string): string {
  const def = getFieldDef(page, section, key);
  if (def && !def.localized) return routing.defaultLocale;
  return locale;
}

function pickValue(
  row: { value: string | null; draftValue: string | null } | null | undefined,
  mode: SiteContentMode
): string | null {
  if (!row) return null;
  if (mode === "draft") return row.draftValue ?? row.value ?? null;
  return row.value ?? null;
}

/**
 * Low-level single-field read. Prefer `getPageContent` for rendering a whole
 * page (one query instead of one per field) — this is for one-off reads,
 * e.g. the admin API resolving a single field.
 */
export async function getSiteContent(
  page: string,
  section: string,
  key: string,
  locale: string,
  mode: SiteContentMode = "published"
): Promise<string | null> {
  const effectiveLocale = resolveLocale(page, section, key, locale);

  const row = await prisma.siteContent.findUnique({
    where: { page_section_key_locale: { page, section, key, locale: effectiveLocale } },
  });

  let value = pickValue(row, mode);

  if ((value === null || value === "") && effectiveLocale !== routing.defaultLocale) {
    const fallbackRow = await prisma.siteContent.findUnique({
      where: { page_section_key_locale: { page, section, key, locale: routing.defaultLocale } },
    });
    value = pickValue(fallbackRow, mode);
  }

  return value;
}

/**
 * Bulk read for rendering one page: one query for the requested locale plus
 * (when different) the default locale for fallback, merged into a
 * section -> key -> value map. Never throws and never returns undefined
 * fields — missing content simply isn't in the map, so callers must supply
 * their own hardcoded/i18n default (see `getLocalizedContent`).
 */
export async function getPageContent(
  page: string,
  locale: string,
  mode: SiteContentMode = "published"
): Promise<PageContentMap> {
  const fields = getPageFields(page);
  if (fields.length === 0) return {};

  const localesToFetch = Array.from(
    new Set(fields.map((f) => (f.localized ? locale : routing.defaultLocale)).concat(routing.defaultLocale))
  );

  let rows: Array<{ section: string; key: string; locale: string; value: string | null; draftValue: string | null }> =
    [];
  try {
    rows = await prisma.siteContent.findMany({
      where: { page, locale: { in: localesToFetch } },
    });
  } catch {
    // CMS content is always optional — a DB hiccup must never break the public page.
    return {};
  }

  const byLocaleThenKey = new Map<string, Map<string, (typeof rows)[number]>>();
  for (const row of rows) {
    if (!byLocaleThenKey.has(row.locale)) byLocaleThenKey.set(row.locale, new Map());
    byLocaleThenKey.get(row.locale)!.set(`${row.section}::${row.key}`, row);
  }

  const map: PageContentMap = {};
  for (const field of fields) {
    const effectiveLocale = field.localized ? locale : routing.defaultLocale;
    const rowKey = `${field.section}::${field.key}`;
    let row = byLocaleThenKey.get(effectiveLocale)?.get(rowKey);
    let value = pickValue(row, mode);

    if ((value === null || value === "") && effectiveLocale !== routing.defaultLocale) {
      row = byLocaleThenKey.get(routing.defaultLocale)?.get(rowKey);
      value = pickValue(row, mode);
    }

    if (value !== null && value !== "") {
      map[field.section] ??= {};
      map[field.section][field.key] = value;
    }
  }

  return map;
}

/**
 * Read one value out of a `getPageContent` map, falling back to the
 * existing hardcoded/i18n default whenever CMS content is absent or empty —
 * the public site must never go blank because of missing CMS rows.
 */
export function getLocalizedContent(map: PageContentMap, section: string, key: string, fallback: string): string {
  const value = map[section]?.[key];
  return value && value.trim() !== "" ? value : fallback;
}

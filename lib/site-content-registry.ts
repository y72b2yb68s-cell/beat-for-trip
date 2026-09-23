/**
 * Single source of truth for every CMS-editable field on the public site.
 * `lib/site-content.ts` (reading) and the admin Website editor (writing) are
 * both driven entirely by this list — nothing here is dynamic/free-form, so
 * the CMS can never expose a field that wasn't explicitly registered.
 */
export type SiteContentFieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "url"
  | "number"
  | "boolean"
  | "beat-selection"
  | "social-links";

export type SiteContentFieldDef = {
  page: string;
  section: string;
  key: string;
  label: string;
  type: SiteContentFieldType;
  /** Whether this field varies per locale. Non-localized fields are always stored/read under the default locale ("en"). */
  localized: boolean;
  helpText?: string;
};

export const CMS_PAGES = [
  "layout",
  "home",
  "catalog",
  "exclusiveBeat",
  "about",
  "footer",
  "seo",
  "settings",
] as const;

export type CmsPage = (typeof CMS_PAGES)[number];

export const CMS_PAGE_LABELS: Record<CmsPage, string> = {
  layout: "Layout",
  home: "Home",
  catalog: "Catalog",
  exclusiveBeat: "Exclusive Beat",
  about: "About",
  footer: "Footer",
  seo: "SEO",
  settings: "Settings",
};

export const SITE_CONTENT_REGISTRY: SiteContentFieldDef[] = [
  // --- Layout (global nav chrome) ---
  { page: "layout", section: "nav", key: "beatsLabel", label: "Nav — Beats label", type: "text", localized: true },
  { page: "layout", section: "nav", key: "aboutLabel", label: "Nav — About label", type: "text", localized: true },

  // --- Home ---
  { page: "home", section: "hero", key: "titleLine1", label: "Hero title — line 1", type: "text", localized: true },
  { page: "home", section: "hero", key: "titleLine2", label: "Hero title — line 2 (accent)", type: "text", localized: true },
  { page: "home", section: "hero", key: "subtitle", label: "Hero subtitle", type: "textarea", localized: true },
  { page: "home", section: "hero", key: "cta", label: "Hero CTA button text", type: "text", localized: true },

  { page: "home", section: "featured", key: "title", label: "Featured Beats — title", type: "text", localized: true },
  { page: "home", section: "featured", key: "subtitle", label: "Featured Beats — subtitle", type: "text", localized: true, helpText: "Optional. Hidden when empty." },
  {
    page: "home",
    section: "featured",
    key: "beatIds",
    label: "Featured Beats — selection & order",
    type: "beat-selection",
    localized: false,
    helpText: "Optional. When empty, falls back to the 4 most recently published beats.",
  },

  { page: "home", section: "cta", key: "title", label: "Bottom CTA — title", type: "text", localized: true },
  { page: "home", section: "cta", key: "subtitle", label: "Bottom CTA — subtitle", type: "textarea", localized: true },
  { page: "home", section: "cta", key: "button", label: "Bottom CTA — button text", type: "text", localized: true },

  // --- Catalog ---
  { page: "catalog", section: "header", key: "title", label: "Catalog — page title", type: "text", localized: true },
  { page: "catalog", section: "header", key: "subtitle", label: "Catalog — subtitle", type: "text", localized: true, helpText: "Optional. Hidden when empty." },
  { page: "catalog", section: "header", key: "searchPlaceholder", label: "Search box placeholder", type: "text", localized: true },

  { page: "catalog", section: "filters", key: "filtersLabel", label: "Filters — label", type: "text", localized: true },
  { page: "catalog", section: "filters", key: "genreLabel", label: "Filters — genre label", type: "text", localized: true },
  { page: "catalog", section: "filters", key: "keyLabel", label: "Filters — key label", type: "text", localized: true },
  { page: "catalog", section: "filters", key: "bpmLabel", label: "Filters — BPM label", type: "text", localized: true },
  { page: "catalog", section: "filters", key: "priceLabel", label: "Filters — price label", type: "text", localized: true },
  { page: "catalog", section: "filters", key: "resetLabel", label: "Filters — reset button", type: "text", localized: true },

  { page: "catalog", section: "sorting", key: "sortByLabel", label: "Sorting — label", type: "text", localized: true },
  { page: "catalog", section: "sorting", key: "newestLabel", label: "Sorting — newest", type: "text", localized: true },
  { page: "catalog", section: "sorting", key: "priceLowHighLabel", label: "Sorting — price low to high", type: "text", localized: true },
  { page: "catalog", section: "sorting", key: "priceHighLowLabel", label: "Sorting — price high to low", type: "text", localized: true },

  { page: "catalog", section: "emptyState", key: "title", label: "Empty state — title", type: "text", localized: true },
  { page: "catalog", section: "emptyState", key: "hint", label: "Empty state — hint", type: "text", localized: true },

  { page: "catalog", section: "exclusiveCta", key: "title", label: "Exclusive-beat banner — title", type: "text", localized: true },
  { page: "catalog", section: "exclusiveCta", key: "subtitle", label: "Exclusive-beat banner — subtitle", type: "text", localized: true },
  { page: "catalog", section: "exclusiveCta", key: "button", label: "Exclusive-beat banner — button text", type: "text", localized: true },

  // --- Exclusive Beat (price is server-authoritative — never editable here) ---
  { page: "exclusiveBeat", section: "hero", key: "title", label: "Title", type: "text", localized: true },
  { page: "exclusiveBeat", section: "hero", key: "description", label: "Description", type: "richtext", localized: true },
  { page: "exclusiveBeat", section: "hero", key: "priceLabel", label: "\"Price\" label above the title", type: "text", localized: true },
  { page: "exclusiveBeat", section: "hero", key: "fromPriceTemplate", label: "Price line template", type: "text", localized: true, helpText: "Use {price} as the placeholder — the actual price always comes from the server, never from here." },
  { page: "exclusiveBeat", section: "benefits", key: "benefit1", label: "Benefit 1", type: "text", localized: true, helpText: "Optional. Only shown when at least one benefit is filled in." },
  { page: "exclusiveBeat", section: "benefits", key: "benefit2", label: "Benefit 2", type: "text", localized: true, helpText: "Optional." },
  { page: "exclusiveBeat", section: "benefits", key: "benefit3", label: "Benefit 3", type: "text", localized: true, helpText: "Optional." },

  // --- About ---
  { page: "about", section: "content", key: "title", label: "Title", type: "text", localized: true },
  { page: "about", section: "content", key: "paragraph1", label: "Paragraph 1", type: "textarea", localized: true },
  { page: "about", section: "content", key: "paragraph2", label: "Paragraph 2", type: "textarea", localized: true },

  // --- Footer ---
  { page: "footer", section: "general", key: "tagline", label: "Tagline", type: "text", localized: true },
  { page: "footer", section: "links", key: "shopLabel", label: "\"Shop\" column heading", type: "text", localized: true },
  { page: "footer", section: "links", key: "legalLabel", label: "\"Legal\" column heading", type: "text", localized: true },
  { page: "footer", section: "links", key: "beatsLabel", label: "Link — Beats", type: "text", localized: true },
  { page: "footer", section: "links", key: "aboutLabel", label: "Link — About", type: "text", localized: true },
  { page: "footer", section: "links", key: "termsLabel", label: "Link — Terms", type: "text", localized: true },
  { page: "footer", section: "links", key: "privacyLabel", label: "Link — Privacy", type: "text", localized: true },
  { page: "footer", section: "links", key: "refundLabel", label: "Link — Refund Policy", type: "text", localized: true },
  { page: "footer", section: "copyright", key: "template", label: "Copyright line", type: "text", localized: true, helpText: "Use {year} as the placeholder for the current year." },

  // --- SEO (per public page; falls back to messages/*.json metadata when empty) ---
  { page: "seo", section: "home", key: "title", label: "Home — meta title", type: "text", localized: true },
  { page: "seo", section: "home", key: "description", label: "Home — meta description", type: "textarea", localized: true },
  { page: "seo", section: "home", key: "ogTitle", label: "Home — OG title", type: "text", localized: true, helpText: "Optional. Falls back to the meta title." },
  { page: "seo", section: "home", key: "ogDescription", label: "Home — OG description", type: "textarea", localized: true, helpText: "Optional. Falls back to the meta description." },

  { page: "seo", section: "catalog", key: "title", label: "Catalog — meta title", type: "text", localized: true },
  { page: "seo", section: "catalog", key: "description", label: "Catalog — meta description", type: "textarea", localized: true },
  { page: "seo", section: "catalog", key: "ogTitle", label: "Catalog — OG title", type: "text", localized: true, helpText: "Optional. Falls back to the meta title." },
  { page: "seo", section: "catalog", key: "ogDescription", label: "Catalog — OG description", type: "textarea", localized: true, helpText: "Optional. Falls back to the meta description." },

  { page: "seo", section: "about", key: "title", label: "About — meta title", type: "text", localized: true },
  { page: "seo", section: "about", key: "description", label: "About — meta description", type: "textarea", localized: true },

  { page: "seo", section: "exclusiveBeat", key: "title", label: "Exclusive Beat — meta title", type: "text", localized: true },
  { page: "seo", section: "exclusiveBeat", key: "description", label: "Exclusive Beat — meta description", type: "textarea", localized: true },

  // --- Settings (site-wide, not tied to a single locale) ---
  { page: "settings", section: "general", key: "siteName", label: "Site name", type: "text", localized: false },
  { page: "settings", section: "seoDefaults", key: "defaultTitle", label: "Default meta title", type: "text", localized: false },
  { page: "settings", section: "seoDefaults", key: "defaultDescription", label: "Default meta description", type: "textarea", localized: false },
  { page: "settings", section: "contact", key: "contactEmail", label: "Contact email", type: "text", localized: false },
  { page: "settings", section: "social", key: "links", label: "Social links", type: "social-links", localized: false },
];

export function getFieldDef(page: string, section: string, key: string): SiteContentFieldDef | undefined {
  return SITE_CONTENT_REGISTRY.find((f) => f.page === page && f.section === section && f.key === key);
}

export function getPageFields(page: string): SiteContentFieldDef[] {
  return SITE_CONTENT_REGISTRY.filter((f) => f.page === page);
}

import { PrismaClient } from "@prisma/client";
import { locales } from "../i18n/routing";

const prisma = new PrismaClient();

type LocalizedEntry = {
  page: string;
  section: string;
  key: string;
  /** Path into messages/{locale}.json, e.g. "hero.titleLine1". */
  messagePath: string;
};

// Existing hardcoded text (from messages/*.json) mapped onto the CMS
// registry. Fields with no existing equivalent — new optional fields like
// "featured subtitle", "exclusive beat benefits", social links, or any text
// that relies on next-intl rich-text tags (the accented home/about titles,
// which would render their literal <accent> tags as plain text once
// CMS-overridden) — are intentionally left out here, so they stay empty
// until an admin deliberately fills them in. See prisma/schema.prisma and
// lib/site-content-registry.ts for the full field list.
const LOCALIZED_ENTRIES: LocalizedEntry[] = [
  { page: "layout", section: "nav", key: "beatsLabel", messagePath: "header.beats" },
  { page: "layout", section: "nav", key: "aboutLabel", messagePath: "header.about" },

  { page: "home", section: "hero", key: "titleLine1", messagePath: "hero.titleLine1" },
  { page: "home", section: "hero", key: "titleLine2", messagePath: "hero.titleLine2" },
  { page: "home", section: "hero", key: "subtitle", messagePath: "hero.subtitle" },
  { page: "home", section: "hero", key: "cta", messagePath: "hero.explore" },
  { page: "home", section: "featured", key: "title", messagePath: "home.featuredTitle" },
  { page: "home", section: "cta", key: "subtitle", messagePath: "home.ctaSubtitle" },
  { page: "home", section: "cta", key: "button", messagePath: "home.browseAll" },

  { page: "catalog", section: "header", key: "title", messagePath: "catalog.title" },
  { page: "catalog", section: "header", key: "searchPlaceholder", messagePath: "catalog.searchPlaceholder" },
  { page: "catalog", section: "filters", key: "filtersLabel", messagePath: "catalog.filters" },
  { page: "catalog", section: "filters", key: "genreLabel", messagePath: "catalog.genre" },
  { page: "catalog", section: "filters", key: "keyLabel", messagePath: "catalog.key" },
  { page: "catalog", section: "filters", key: "bpmLabel", messagePath: "catalog.bpm" },
  { page: "catalog", section: "filters", key: "priceLabel", messagePath: "catalog.price" },
  { page: "catalog", section: "filters", key: "resetLabel", messagePath: "catalog.resetFilters" },
  { page: "catalog", section: "sorting", key: "sortByLabel", messagePath: "catalog.sortBy" },
  { page: "catalog", section: "sorting", key: "newestLabel", messagePath: "catalog.newest" },
  { page: "catalog", section: "sorting", key: "priceLowHighLabel", messagePath: "catalog.priceLowHigh" },
  { page: "catalog", section: "sorting", key: "priceHighLowLabel", messagePath: "catalog.priceHighLow" },
  { page: "catalog", section: "emptyState", key: "title", messagePath: "catalog.noResultsTitle" },
  { page: "catalog", section: "emptyState", key: "hint", messagePath: "catalog.noResultsHint" },
  { page: "catalog", section: "exclusiveCta", key: "title", messagePath: "catalog.exclusiveCtaTitle" },
  { page: "catalog", section: "exclusiveCta", key: "subtitle", messagePath: "catalog.exclusiveCtaSubtitle" },
  { page: "catalog", section: "exclusiveCta", key: "button", messagePath: "catalog.exclusiveCtaButton" },

  { page: "exclusiveBeat", section: "hero", key: "title", messagePath: "exclusiveBeat.title" },
  { page: "exclusiveBeat", section: "hero", key: "description", messagePath: "exclusiveBeat.description" },
  { page: "exclusiveBeat", section: "hero", key: "priceLabel", messagePath: "exclusiveBeat.priceLabel" },
  // exclusiveBeat.fromPrice is already "From {price}" — the exact template shape we read at render time.
  { page: "exclusiveBeat", section: "hero", key: "fromPriceTemplate", messagePath: "exclusiveBeat.fromPrice" },

  { page: "about", section: "content", key: "paragraph1", messagePath: "about.paragraph1" },
  { page: "about", section: "content", key: "paragraph2", messagePath: "about.paragraph2" },

  { page: "footer", section: "general", key: "tagline", messagePath: "footer.tagline" },
  { page: "footer", section: "links", key: "shopLabel", messagePath: "footer.shop" },
  { page: "footer", section: "links", key: "legalLabel", messagePath: "footer.legal" },
  { page: "footer", section: "links", key: "beatsLabel", messagePath: "footer.beats" },
  { page: "footer", section: "links", key: "aboutLabel", messagePath: "footer.about" },
  { page: "footer", section: "links", key: "termsLabel", messagePath: "footer.terms" },
  { page: "footer", section: "links", key: "privacyLabel", messagePath: "footer.privacy" },
  // footer.copyright is already "© {year} Beat For Trip. All rights reserved." — same {year} placeholder convention.
  { page: "footer", section: "copyright", key: "template", messagePath: "footer.copyright" },

  { page: "seo", section: "home", key: "title", messagePath: "metadata.home.title" },
  { page: "seo", section: "home", key: "description", messagePath: "metadata.home.description" },
  { page: "seo", section: "catalog", key: "title", messagePath: "metadata.beats.title" },
  { page: "seo", section: "catalog", key: "description", messagePath: "metadata.beats.description" },
  { page: "seo", section: "about", key: "title", messagePath: "metadata.about.title" },
  { page: "seo", section: "about", key: "description", messagePath: "metadata.about.description" },
  { page: "seo", section: "exclusiveBeat", key: "title", messagePath: "metadata.exclusiveBeat.title" },
  { page: "seo", section: "exclusiveBeat", key: "description", messagePath: "metadata.exclusiveBeat.description" },
];

// Non-localized fields — stored once under the default locale. Only the
// site name has an unambiguous existing value (it's the app's own brand
// name, used verbatim in the Header/Footer logo). The rest have no current
// hardcoded equivalent, so they're left for an admin to fill in later.
const DEFAULT_LOCALE_ENTRIES: Array<{ page: string; section: string; key: string; value: string }> = [
  { page: "settings", section: "general", key: "siteName", value: "Beat For Trip" },
];

function readPath(obj: unknown, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
  return typeof value === "string" ? value : undefined;
}

async function upsertIfMissing(page: string, section: string, key: string, locale: string, text: string) {
  const existing = await prisma.siteContent.findUnique({
    where: { page_section_key_locale: { page, section, key, locale } },
  });
  if (existing) return; // never overwrite content an admin may already be editing

  await prisma.siteContent.create({
    data: { page, section, key, locale, value: text, draftValue: text },
  });
}

async function main() {
  let created = 0;

  for (const locale of locales) {
    const messages = (await import(`../messages/${locale}.json`)).default;

    for (const entry of LOCALIZED_ENTRIES) {
      const text = readPath(messages, entry.messagePath);
      if (text === undefined) continue;
      await upsertIfMissing(entry.page, entry.section, entry.key, locale, text);
      created++;
    }
  }

  for (const entry of DEFAULT_LOCALE_ENTRIES) {
    await upsertIfMissing(entry.page, entry.section, entry.key, "en", entry.value);
    created++;
  }

  console.log(`Site content seed complete (${created} field/locale rows checked, existing rows left untouched).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

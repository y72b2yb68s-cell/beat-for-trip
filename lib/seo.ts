import { routing, type AppLocale } from "@/i18n/routing";
import { getLocalizedContent, getPageContent } from "./site-content";

export function localePath(locale: AppLocale, pathname: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const suffix = pathname === "/" ? "" : pathname;
  return `${prefix}${suffix}` || "/";
}

/**
 * Builds a canonical URL plus an hreflang alternate for every supported
 * locale (relative paths, resolved against metadataBase). `pathname` is the
 * canonical, locale-free path, e.g. "/", "/beats", "/beats/midnight-trip".
 */
export function buildAlternates(locale: AppLocale, pathname: string) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = localePath(l, pathname);
  }
  languages["x-default"] = localePath(routing.defaultLocale, pathname);

  return {
    canonical: localePath(locale, pathname),
    languages,
  };
}

export type SeoOverride = { title: string; description: string; ogTitle: string; ogDescription: string };

/**
 * CMS-driven SEO overrides for a page's `generateMetadata`. Falls back to the
 * existing i18n metadata strings whenever a CMS field is empty, so metadata
 * can never go blank because of missing CMS content.
 */
export async function getSeoOverride(
  page: string,
  locale: AppLocale,
  fallback: { title: string; description: string }
): Promise<SeoOverride> {
  const content = await getPageContent("seo", locale);
  const title = getLocalizedContent(content, page, "title", fallback.title);
  const description = getLocalizedContent(content, page, "description", fallback.description);
  const ogTitle = getLocalizedContent(content, page, "ogTitle", title);
  const ogDescription = getLocalizedContent(content, page, "ogDescription", description);
  return { title, description, ogTitle, ogDescription };
}

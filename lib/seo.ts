import { routing, type AppLocale } from "@/i18n/routing";

function localePath(locale: AppLocale, pathname: string): string {
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

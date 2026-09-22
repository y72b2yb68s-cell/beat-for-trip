import { defineRouting } from "next-intl/routing";

export const locales = ["en", "hu", "it", "pl", "fr", "es", "ro", "cs", "de"] as const;

export type AppLocale = (typeof locales)[number];

export const localeNames: Record<AppLocale, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  hu: "Magyar",
  pl: "Polski",
  ro: "Română",
  cs: "Čeština",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});

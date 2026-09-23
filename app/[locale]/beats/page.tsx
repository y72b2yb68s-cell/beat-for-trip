import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BeatsCatalog from "@/components/beats/BeatsCatalog";
import { getPublishedBeats } from "@/lib/beats";
import { buildAlternates, getSeoOverride } from "@/lib/seo";
import { getPageContent } from "@/lib/site-content";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.beats" });
  const seo = await getSeoOverride("catalog", locale, { title: t("title"), description: t("description") });

  return {
    title: seo.title,
    description: seo.description,
    alternates: buildAlternates(locale, "/beats"),
  };
}

export default async function BeatsPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const beats = await getPublishedBeats();
  const pageContent = await getPageContent("catalog", locale);

  const content = {
    title: pageContent.header?.title,
    subtitle: pageContent.header?.subtitle,
    searchPlaceholder: pageContent.header?.searchPlaceholder,
    exclusiveCtaTitle: pageContent.exclusiveCta?.title,
    exclusiveCtaSubtitle: pageContent.exclusiveCta?.subtitle,
    exclusiveCtaButton: pageContent.exclusiveCta?.button,
  };

  return <BeatsCatalog beats={beats} content={content} />;
}

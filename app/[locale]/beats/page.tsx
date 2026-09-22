import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BeatsCatalog from "@/components/beats/BeatsCatalog";
import { getPublishedBeats } from "@/lib/beats";
import { buildAlternates } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.beats" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/beats"),
  };
}

export default async function BeatsPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const beats = await getPublishedBeats();
  return <BeatsCatalog beats={beats} />;
}

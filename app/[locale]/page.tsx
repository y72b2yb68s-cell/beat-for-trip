import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/home/Hero";
import CtaSection from "@/components/home/CtaSection";
import BeatGrid from "@/components/beats/BeatGrid";
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
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const beats = await getPublishedBeats();
  const featured = beats.slice(0, 4);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
            {t("featuredTitle")}
          </h2>
        </div>
        <BeatGrid beats={featured} />
      </section>

      <CtaSection />
    </>
  );
}

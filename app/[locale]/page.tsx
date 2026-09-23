import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/home/Hero";
import CtaSection from "@/components/home/CtaSection";
import BeatGrid from "@/components/beats/BeatGrid";
import { getPublishedBeats } from "@/lib/beats";
import { buildAlternates, getSeoOverride } from "@/lib/seo";
import { getLocalizedContent, getPageContent } from "@/lib/site-content";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  const seo = await getSeoOverride("home", locale, { title: t("title"), description: t("description") });

  return {
    title: seo.title,
    description: seo.description,
    alternates: buildAlternates(locale, "/"),
    openGraph: { title: seo.ogTitle, description: seo.ogDescription },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const beats = await getPublishedBeats();
  const content = await getPageContent("home", locale);

  const heroContent = {
    titleLine1: content.hero?.titleLine1,
    titleLine2: content.hero?.titleLine2,
    subtitle: content.hero?.subtitle,
    cta: content.hero?.cta,
  };
  const ctaContent = {
    title: content.cta?.title,
    subtitle: content.cta?.subtitle,
    button: content.cta?.button,
  };

  const featuredTitle = getLocalizedContent(content, "featured", "title", t("featuredTitle"));
  const featuredSubtitle = content.featured?.subtitle;

  let featured = beats.slice(0, 4);
  const rawBeatIds = content.featured?.beatIds;
  if (rawBeatIds) {
    try {
      const ids: string[] = JSON.parse(rawBeatIds);
      if (Array.isArray(ids) && ids.length > 0) {
        const byId = new Map(beats.map((b) => [b.id, b]));
        const curated = ids.map((id) => byId.get(id)).filter((b): b is NonNullable<typeof b> => Boolean(b));
        if (curated.length > 0) featured = curated;
      }
    } catch {
      // malformed CMS selection — keep the default (most recent) beats
    }
  }

  return (
    <>
      <Hero content={heroContent} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
              {featuredTitle}
            </h2>
            {featuredSubtitle && <p className="mt-1 text-sm text-muted">{featuredSubtitle}</p>}
          </div>
        </div>
        <BeatGrid beats={featured} />
      </section>

      <CtaSection content={ctaContent} />
    </>
  );
}

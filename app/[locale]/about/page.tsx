import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "metadata.about" });
  const seo = await getSeoOverride("about", locale, { title: t("title"), description: t("description") });
  return {
    title: seo.title,
    description: seo.description,
    alternates: buildAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const content = await getPageContent("about", locale);

  const cmsTitle = content.content?.title;
  const paragraph1 = getLocalizedContent(content, "content", "paragraph1", t("paragraph1"));
  const paragraph2 = getLocalizedContent(content, "content", "paragraph2", t("paragraph2"));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl [&_span]:text-green">
        {cmsTitle || t.rich("title", { accent: (chunks) => <span>{chunks}</span> })}
      </h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-muted sm:text-base">
        <p>{paragraph1}</p>
        <p>{paragraph2}</p>
      </div>
    </div>
  );
}

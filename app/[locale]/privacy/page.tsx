import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.privacy" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-muted sm:text-base">
        <p>{t("paragraph1")}</p>
        <p>{t("paragraph2")}</p>
      </div>
    </div>
  );
}

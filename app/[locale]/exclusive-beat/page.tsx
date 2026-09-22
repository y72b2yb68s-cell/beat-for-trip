import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { getExclusiveBeatTier } from "@/lib/exclusive-beat";
import { formatPrice } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import ExclusiveBeatBuyForm from "@/components/beats/ExclusiveBeatBuyForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.exclusiveBeat" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/exclusive-beat"),
  };
}

export default async function ExclusiveBeatPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("exclusiveBeat");

  const tier = getExclusiveBeatTier();
  const price = tier?.price ?? 30;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green">
              {t("priceLabel")}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
            {t("description")}
          </p>
          <p className="text-lg font-semibold text-green">
            {t("fromPrice", { price: formatPrice(price, locale) })}
          </p>
        </div>

        <div className="sm:sticky sm:top-24 sm:self-start">
          <ExclusiveBeatBuyForm price={price} />
        </div>
      </div>
    </div>
  );
}

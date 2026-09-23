import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates, getSeoOverride } from "@/lib/seo";
import { getPageContent } from "@/lib/site-content";
import { getExclusiveBeatTier } from "@/lib/exclusive-beat";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import ExclusiveBeatBuyForm from "@/components/beats/ExclusiveBeatBuyForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.exclusiveBeat" });
  const seo = await getSeoOverride("exclusiveBeat", locale, { title: t("title"), description: t("description") });
  return {
    title: seo.title,
    description: seo.description,
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
  const tBeat = await getTranslations("beat");
  const tFooter = await getTranslations("footer");
  const tTerms = await getTranslations("terms");
  const content = await getPageContent("exclusiveBeat", locale);

  // Price is always resolved server-side from the tier config — CMS content
  // never supplies a price, only the display text around it.
  const tier = getExclusiveBeatTier();
  const price = tier?.price ?? 30;

  const title = content.hero?.title || t("title");
  const description = content.hero?.description || t("description");
  const priceLabel = content.hero?.priceLabel || t("priceLabel");
  const fromPriceTemplate = content.hero?.fromPriceTemplate || t("fromPrice", { price: "{price}" });
  const fromPrice = fromPriceTemplate.includes("{price}")
    ? fromPriceTemplate.replace("{price}", formatPrice(price, locale))
    : fromPriceTemplate;

  const benefits = [content.benefits?.benefit1, content.benefits?.benefit2, content.benefits?.benefit3].filter(
    (b): b is string => Boolean(b && b.trim() !== "")
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green">{priceLabel}</p>
            <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">{description}</p>

          {benefits.length > 0 && (
            <ul className="flex flex-col gap-2 text-sm text-foreground/90 sm:text-base">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green" />
                  {benefit}
                </li>
              ))}
            </ul>
          )}

          <p className="text-lg font-semibold text-green">{fromPrice}</p>

          <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface/50 px-4 py-3 text-xs text-muted">
            <p className="font-semibold uppercase tracking-wide text-foreground">
              {tBeat("digitalProduct")} · {t("exclusivePurchaseLabel")}
            </p>
            <p>{tBeat("format")}: WAV</p>
            <p>{tTerms("exclusiveBeatClause")}</p>
            <p>
              {tBeat("license")}:{" "}
              <Link href="/terms" className="text-green hover:underline">
                {tFooter("terms")}
              </Link>
            </p>
          </div>
        </div>

        <div className="sm:sticky sm:top-24 sm:self-start">
          <ExclusiveBeatBuyForm price={price} />
        </div>
      </div>
    </div>
  );
}

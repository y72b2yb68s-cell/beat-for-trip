import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { getPageContent } from "@/lib/site-content";
import { LEGAL_NAME, BUSINESS_ADDRESS, CONTACT_PHONE, FALLBACK_CONTACT_EMAIL } from "@/lib/business-info";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.refund" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/refund"),
  };
}

export default async function RefundPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("refund");
  const settings = await getPageContent("settings", locale);
  const contactEmail = settings.contact?.contactEmail || FALLBACK_CONTACT_EMAIL;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-muted sm:text-base">
        <p>{t("paragraph1")}</p>
        <p>{t("paragraph2", { email: contactEmail })}</p>
      </div>

      <div className="mt-8 border-t border-border pt-6 text-sm text-muted">
        <p>{LEGAL_NAME}</p>
        <p>{BUSINESS_ADDRESS}</p>
        <p>
          {CONTACT_PHONE} · {contactEmail}
        </p>
      </div>
    </div>
  );
}

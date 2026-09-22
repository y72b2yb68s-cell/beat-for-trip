import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Button from "@/components/ui/Button";
import { buildAlternates } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.paymentFailed" });
  return { title: t("title"), alternates: buildAlternates(locale, "/payment/failed") };
}

export default async function PaymentFailedPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("payment");

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="mt-5 text-lg font-bold uppercase tracking-tight text-foreground">
          {t("failedTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("noChargeMade")}</p>
        <Button href="/beats" size="lg" className="mt-6 w-full">
          {t("backToBeats")}
        </Button>
      </div>
    </div>
  );
}

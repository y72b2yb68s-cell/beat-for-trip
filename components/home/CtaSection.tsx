import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function CtaSection() {
  const t = useTranslations("home");

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground sm:text-4xl [&_span]:text-green">
          {t.rich("ctaTitle", { accent: (chunks) => <span>{chunks}</span> })}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted sm:text-base">{t("ctaSubtitle")}</p>
        <div className="mt-8 flex justify-center">
          <Button href="/beats" size="lg">
            {t("browseAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}

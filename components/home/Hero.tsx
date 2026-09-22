import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,255,102,0.16),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-green/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-green/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <h1 className="glow-text text-4xl font-extrabold uppercase leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {t("titleLine1")}
          <br />
          <span className="text-green">{t("titleLine2")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg">{t("subtitle")}</p>
        <div className="mt-10 flex justify-center">
          <Button href="/beats" size="lg">
            {t("explore")}
          </Button>
        </div>
      </div>
    </section>
  );
}

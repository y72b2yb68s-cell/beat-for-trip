import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-green">404</p>
      <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
        {t("title404")}
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted">{t("desc404")}</p>
      <Button href="/" size="lg" className="mt-8">
        {t("backHome")}
      </Button>
    </div>
  );
}

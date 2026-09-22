import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-bold tracking-[0.2em] text-foreground">
              BEAT<span className="text-green">FOR</span>TRIP
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted">{t("tagline")}</p>
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {t("shop")}
              </span>
              <Link href="/beats" className="text-sm text-foreground hover:text-green">
                {t("beats")}
              </Link>
              <Link href="/about" className="text-sm text-foreground hover:text-green">
                {t("about")}
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {t("legal")}
              </span>
              <Link href="/terms" className="text-sm text-foreground hover:text-green">
                {t("terms")}
              </Link>
              <Link href="/privacy" className="text-sm text-foreground hover:text-green">
                {t("privacy")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted">
          {t("copyright", { year })}
        </div>
      </div>
    </footer>
  );
}

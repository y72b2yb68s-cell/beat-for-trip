"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
        {t("titleError")}
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted">{t("descError")}</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset} size="lg">
          {t("tryAgain")}
        </Button>
        <Button href="/" variant="outline" size="lg">
          {t("backHome")}
        </Button>
      </div>
    </div>
  );
}
